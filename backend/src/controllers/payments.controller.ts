import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { VNPay, ignoreLogger, HashAlgorithm, ProductCode, VnpLocale, dateFormat } from 'vnpay'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { IUserRequest } from '@/types/user'
import { customAlphabet } from 'nanoid'

interface IProduct {
  maSanPham: string
  soLuong: number
  donGia: number
  loai: 'combo' | 'sanpham'
}

interface IVNPayRequestBody {
  maPhim: string
  maSuatChieu: string
  selectedSeats: { maGhe: string; giaTien: number }[]
  selectedFoods: IProduct[]
  maKhuyenMai?: string
  tongTien: number
}

class ThanhToansController {

  // [POST] /payments/create-vnpay
  async createVNPay(req: IUserRequest, res: Response) {
    const { maPhim, maSuatChieu, selectedSeats, selectedFoods, maKhuyenMai, tongTien }: IVNPayRequestBody = req.body
    const maNguoiDung = req.user?.maNguoiDung

    if (!maSuatChieu || !selectedSeats || selectedSeats.length === 0 || !tongTien || !maNguoiDung) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng.' })
    }

    
    const maVe = await generateIncrementalId(prisma.vE, 'maVe', 'VE')
    const orderId = `ORDER-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12)()}` 

    if(!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET || !process.env.VNPAY_RETURN_URL) {
      return res.status(500).json({ message: 'Cấu hình VNPAY chưa được thiết lập' })
    }

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_HASH_SECRET,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true,
      hashAlgorithm: HashAlgorithm.SHA512,
      loggerFn: ignoreLogger,
    })
    const vnpayReponse = await vnpay.buildPaymentUrl({
      vnp_Amount: tongTien, 
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán vé xem phim: ${maVe}`, 
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL, 
      vnp_Locale: VnpLocale.VN, 
      vnp_CreateDate: dateFormat(new Date()), 
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 10 * 60 * 1000)), 
    })

    await prisma.vE.create({
      data: {
        maVe,
        maPhim,
        maSuatChieu,
        maNguoiDung,
        maQR: customAlphabet('0123456789', 10)(),
        hinhThuc: 'Online',
        phuongThucThanhToan: 'VNPAY',
        maGiaoDich: orderId,
        trangThaiThanhToan: 'ChuaThanhToan',
        maKhuyenMai: maKhuyenMai || null,
        tongTien,
        chiTietVes: {
          create: selectedSeats.map((seat: any) => ({
            maGhe: seat.maGhe,
            donGia: seat.giaTien,
          }))
        },
        ...(selectedFoods?.length > 0 && {
          veCombos: {
            create: selectedFoods
              .filter((f: IProduct) => f.loai === 'combo')
              .map((f: IProduct) => ({
                maCombo: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
          },
          veSanPhams: {
            create: selectedFoods
              .filter((f: IProduct) => f.loai === 'sanpham')
              .map((f: IProduct) => ({
                maSanPham: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
          },
        }),
      } 
    })

    return res.status(201).json(vnpayReponse)
  }

  // [GET] /payments/vnpay/vnpay-return
  async handleVNPayReturn (req: Request, res: Response) {
    try {
      const { vnp_ResponseCode, vnp_TxnRef } = req.query
      if( vnp_ResponseCode != '00') {
        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      const ve = await prisma.vE.findUnique({
        where: { maGiaoDich: vnp_TxnRef as string },
        include: { chiTietVes: true }
      })
      if(!ve) {
        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      await prisma.$transaction([
        prisma.vE.update({
          where: { maGiaoDich: vnp_TxnRef as string },
          data: { trangThaiThanhToan: 'DaThanhToan' }
        }),
        prisma.gHE_SUATCHIEU.updateMany({
          where: {
            maSuatChieu: ve.maSuatChieu,
            maGhe: { in: ve.chiTietVes.map(ct => ct.maGhe) },
          },
          data: { trangThaiGhe: 'DaDat' }
        }),
        prisma.nGUOIDUNG.updateMany({
          where: { maNguoiDung: ve.maNguoiDung },
          data: { diemTichLuy: { increment: Math.floor(ve.tongTien / 1000) } }
        })
      ])

      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=success`)
    } catch (error) {
      console.error('Lỗi xử lý trả về VNPAY:', error)
      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
    }
  }
}

export default new ThanhToansController()