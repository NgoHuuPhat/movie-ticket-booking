import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { VNPay, ignoreLogger, HashAlgorithm, ProductCode, VnpLocale, dateFormat } from 'vnpay'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { IUserRequest } from '@/types/user'
import { customAlphabet } from 'nanoid'
import { IVNPayRequestBody } from '@/types/payment'
import QRCode from 'qrcode'
import { addTicketEmailToQueue } from '@/queues/email.queue'
import { redisClient } from '@/services/redis.service'

class ThanhToansController {

  // [POST] /payments/create-vnpay
  async createVNPay(req: IUserRequest, res: Response) {
    const { maPhim, maSuatChieu, selectedSeats, selectedFoods, maCodeKhuyenMai, tongTien }: IVNPayRequestBody = req.body
    const maNguoiDung = req.user?.maNguoiDung
    let maKhuyenMai: string | undefined

    if (!maSuatChieu || !selectedSeats || selectedSeats.length === 0 || !tongTien || !maNguoiDung) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng.' })
    }

    for(const seat of selectedSeats) {
      const holder = await redisClient.get(`seathold:${maSuatChieu}:${seat.maGhe}`)
      if(holder === maNguoiDung) {
        await redisClient.expire(`seathold:${maSuatChieu}:${seat.maGhe}`, 5 * 60)
      }
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
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 5 * 60 * 1000)), 
    })

    if(maCodeKhuyenMai) {
      const khuyenMai = await prisma.kHUYENMAI.findUnique({
        where: { maCode: maCodeKhuyenMai },
        select : { maKhuyenMai: true }
      })
      if(!khuyenMai) {
        return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ.' })
      }

      maKhuyenMai = khuyenMai.maKhuyenMai
    }

    await prisma.$transaction(async (tx) => {
      const ve = await tx.vE.create({
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
            create: selectedSeats.map((seat) => ({
              maGhe: seat.maGhe,
              donGia: seat.giaTien,
            })),
          },
        },
      })

      if (selectedFoods?.length > 0) {
        const combos = selectedFoods.filter((f) => f.loai === 'combo')
        const sanPhams = selectedFoods.filter((f) => f.loai === 'sanpham')

        if (combos.length > 0) {
          await tx.vE_COMBO.createMany({
            data: combos.map((f) => ({
              maVe: ve.maVe,
              maCombo: f.maSanPham,
              soLuong: f.soLuong,
              donGia: f.donGia,
              tongTien: f.donGia * f.soLuong,
            })),
          })
        }

        if (sanPhams.length > 0) {
          await tx.vE_SANPHAM.createMany({
            data: sanPhams.map((f) => ({
              maVe: ve.maVe,
              maSanPham: f.maSanPham,
              soLuong: f.soLuong,
              donGia: f.donGia,
              tongTien: f.donGia * f.soLuong,
            })),
          })
        }
      }
    })

    return res.status(201).json(vnpayReponse)
  }

  // [GET] /payments/vnpay/vnpay-return
  async handleVNPayReturn (req: Request, res: Response) {
    try {
      const { vnp_ResponseCode, vnp_TxnRef, vnp_PayDate } = req.query
      
      if(vnp_ResponseCode != '00') {
        const ve = await prisma.vE.findUnique({
          where: { maGiaoDich: vnp_TxnRef as string },
          select: { 
            maNguoiDung: true,
            maSuatChieu: true,
            chiTietVes: { select: { maGhe: true } }
          }
        })

        if(ve) {
          for(const ct of ve.chiTietVes) {
            const holder = await redisClient.get(`seathold:${ve.maSuatChieu}:${ct.maGhe}`)
            if(holder === ve.maNguoiDung) {
              const res = await redisClient.del(`seathold:${ve.maSuatChieu}:${ct.maGhe}`)
            }
          }
        }

        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      const ve = await prisma.vE.findUnique({
        where: { maGiaoDich: vnp_TxnRef as string },
        include: { 
          chiTietVes: { include: { ghe: true } }, 
          nguoiDung: { select: { email: true } },
          phim: true,
          suatChieu: { include: { phongChieu: true } },
          veCombos: true,
          veSanPhams: true,
          khuyenMai: true,
        },
      })

      if(!ve) {
        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      for(const ct of ve.chiTietVes) {
        const holder = await redisClient.get(`seathold:${ve.maSuatChieu}:${ct.maGhe}`)
        if(holder === ve.maNguoiDung) {
          await redisClient.del(`seathold:${ve.maSuatChieu}:${ct.maGhe}`)
        }
      }

      const parseVnpPayDate = (vnpPayDate: string) => {
        const year = vnpPayDate.substring(0, 4)
        const month = vnpPayDate.substring(4, 6)
        const day = vnpPayDate.substring(6, 8)
        const hour = vnpPayDate.substring(8, 10)
        const minute = vnpPayDate.substring(10, 12)
        const second = vnpPayDate.substring(12, 14)
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
      }
      const ngayThanhToan = parseVnpPayDate(vnp_PayDate as string)

      await prisma.$transaction([
        prisma.vE.update({
          where: { maGiaoDich: vnp_TxnRef as string },
          data: { trangThaiThanhToan: 'DaThanhToan', ngayMua: ngayThanhToan }
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

      const qrBase64 = await QRCode.toDataURL(ve.maQR)
      const tienVe = ve.chiTietVes.reduce((sum, ct) => sum + ct.donGia, 0)
      const tienCombo = (ve.veCombos?.reduce((sum, c) => sum + c.tongTien, 0) || 0) + 
                        (ve.veSanPhams?.reduce((sum, s) => sum + s.tongTien, 0) || 0)

      const tongTienTruocGiam = tienVe + tienCombo
      
      let soTienGiamGia = 0
      if(ve.khuyenMai?.maCode && ve.maKhuyenMai) {
        if(ve.khuyenMai.loaiKhuyenMai === 'GiamPhanTram') {
          soTienGiamGia = Math.floor(tongTienTruocGiam * (ve.khuyenMai.giaTriGiam / 100))
        } else if(ve.khuyenMai.loaiKhuyenMai === 'GiamGiaTien') {
          soTienGiamGia = ve.khuyenMai.giaTriGiam
        }
      }

      const ticketData = {
        maQR: ve.maQR,
        tenPhim: ve.phim.tenPhim,
        phongChieu: ve.suatChieu.phongChieu.tenPhong,
        ngayChieu: new Date(ve.suatChieu.ngayChieu).toLocaleDateString('vi-VN'),
        gioChieu: new Date(ve.suatChieu.gioChieu).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        ghe: ve.chiTietVes.map(ct => `${ct.ghe.hangGhe}${ct.ghe.soGhe}`),
        thoiGianThanhToan: ngayThanhToan.toLocaleString('vi-VN'),
        tienComboBapNuoc: tienCombo,
        soTienGiamGia: ve.maKhuyenMai ? soTienGiamGia : 0,
        tongTien: tongTienTruocGiam,
        soTienThanhToan: ve.tongTien,
      }
      const subject = `Thông tin đặt vé xem phim - ${ve.phim.tenPhim} - Lê Độ Cinema`
      await addTicketEmailToQueue(ve.nguoiDung.email, subject, ticketData, qrBase64)

      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=success`)
    } catch (error) {
      console.error('Lỗi xử lý trả về VNPAY:', error)
      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
    }
  }
}

export default new ThanhToansController()