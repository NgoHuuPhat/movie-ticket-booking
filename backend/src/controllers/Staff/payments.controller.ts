import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { VNPay, ignoreLogger, HashAlgorithm, ProductCode, VnpLocale, dateFormat } from 'vnpay'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { IUserRequest } from '@/types/user'
import { customAlphabet } from 'nanoid'
import { IPaymentRequestBody } from '@/types/payment'
import { redisClient } from '@/services/redis.service'
import { generateTicketPDF } from '@/services/ticket.service'

class ThanhToansController {

  // [POST] /staff/payments/create-vnpay
  async createVNPay(req: IUserRequest, res: Response) {
    const { maSuatChieu, selectedSeats, selectedFoods, tongTien, soDienThoaiNguoiDung }: IPaymentRequestBody = req.body
    console.log('Yêu cầu tạo thanh toán VNPAY:', req.body)
    const maNhanVienBanVe = req.user?.maNguoiDung
    let nguoiDung = null

    if(soDienThoaiNguoiDung){
      nguoiDung = await prisma.nGUOIDUNG.findUnique({
        where: { soDienThoai: soDienThoaiNguoiDung },
      })
      if(!nguoiDung){
        return res.status(404).json({ message: 'Khách hàng không tồn tại' })
      }  
    } 

    if (!maSuatChieu || !selectedSeats?.length || !tongTien || !maNhanVienBanVe) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng.' })
    }

    // Extend time seat hold
    for (const seat of selectedSeats) {
      const key = `seathold:${maSuatChieu}:${seat.maGhe}`
      const holder = await redisClient.get(key)
      if (holder === maNhanVienBanVe) {
        await redisClient.expire(key, 10 * 60) 
      }
    }

    if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET || !process.env.VNPAY_STAFF_RETURN_URL) {
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

    const orderId = `ORDER-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12)()}`
    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: tongTien,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán hóa đơn vé xem phim: ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_STAFF_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 10 * 60 * 1000)),
    })

    await redisClient.set(
      `pending_order:${orderId}`,
      JSON.stringify({
        maNhanVienBanVe,
        maNguoiDung: nguoiDung?.maNguoiDung || null,
        maSuatChieu,
        selectedSeats,
        selectedFoods: selectedFoods || [],
        tongTien,
        createdAt: new Date().toISOString(),
      }),
      'EX', 15 * 60
    )

    return res.status(201).json(vnpayResponse)
  }

  // [GET] /staff/payments/vnpay/vnpay-return
  async handleVNPayReturn(req: Request, res: Response) {
    try {
      const { vnp_ResponseCode, vnp_TxnRef } = req.query as {
        vnp_ResponseCode: string
        vnp_TxnRef: string
      }

      const orderId = vnp_TxnRef
      const pendingDataStr = await redisClient.get(`pending_order:${orderId}`)
      let pending: any = null

      if (pendingDataStr) {
        pending = JSON.parse(pendingDataStr)
      }

      // Payment failed
      if (vnp_ResponseCode !== '00') {
        if (pending?.selectedSeats?.length) {
          for (const seat of pending.selectedSeats) {
            const key = `seathold:${pending.maSuatChieu}:${seat.maGhe}`
            const holder = await redisClient.get(key)
            if (holder === pending.maNhanVienBanVe) {
              await redisClient.del(key)
            }
          }
        }

        await redisClient.del(`pending_order:${orderId}`)
        return res.redirect(`${process.env.VNPAY_STAFF_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      if (!pending) {
        console.warn(`Không tìm thấy pending order cho ${orderId}`)
        return res.status(400).json({ message: 'Đơn hàng đã hết hạn hoặc không tồn tại.' })
      }

      const hoaDon = await prisma.$transaction(async (tx) => {
        const maHoaDon = await generateIncrementalId(tx.hOADON, 'maHoaDon', 'HD')

        // create HOADON
        const createdHoaDon = await tx.hOADON.create({
          data: {
            maHoaDon,
            maQR: customAlphabet('0123456789', 10)(),
            maNguoiDung: pending.maNguoiDung,
            maNhanVienBanVe: pending.maNhanVienBanVe,
            maGiaoDich: orderId,
            tongTien: pending.tongTien,
            phuongThucThanhToan: 'VNPAY',
            hinhThucDatVe: 'Offline'
          },
        })

        const gheSuatChieuIds: string[] = []
        for (const seat of pending.selectedSeats) {
          const gheSuatChieu = await tx.gHE_SUATCHIEU.findUnique({
            where: {
              maGhe_maSuatChieu: {
                maGhe: seat.maGhe,
                maSuatChieu: pending.maSuatChieu,
              },
            },
          })

          if (!gheSuatChieu) {
            throw new Error(`Ghế ${seat.maGhe} không tồn tại trong suất chiếu ${pending.maSuatChieu}`)
          }
          gheSuatChieuIds.push(gheSuatChieu.maGheSuatChieu)

          const maVe = await generateIncrementalId(tx.vE, 'maVe', 'VE')
          await tx.vE.create({
            data: {
              maVe,
              maGheSuatChieu: gheSuatChieu.maGheSuatChieu,
              maHoaDon,
              giaVe: seat.giaTien,
              trangThai: 'DaThanhToan',
            },
          })
        }

        // Create HOADON_COMBO and HOADON_SANPHAM
        if (pending.selectedFoods?.length > 0) {
          const combos = pending.selectedFoods.filter((f: any) => f.loai === 'combo')
          const sanPhams = pending.selectedFoods.filter((f: any) => f.loai === 'sanpham')

          if (combos.length > 0) {
            await tx.hOADON_COMBO.createMany({
              data: combos.map((f: any) => ({
                maHoaDon,
                maCombo: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
            })
          }

          if (sanPhams.length > 0) {
            await tx.hOADON_SANPHAM.createMany({
              data: sanPhams.map((f: any) => ({
                maHoaDon,
                maSanPham: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
            })
          }
        }

        if (gheSuatChieuIds.length > 0) {
          await tx.gHE_SUATCHIEU.updateMany({
            where: { maGheSuatChieu: { in: gheSuatChieuIds } },
            data: { trangThaiGhe: 'DaDat' },
          })
        }

        if(pending.maNguoiDung){
          const updatedUser = await tx.nGUOIDUNG.update({
            where: { maNguoiDung: pending.maNguoiDung },
            data: { diemTichLuy: { increment: Math.floor(pending.tongTien / 1000) } },
          })

          if(updatedUser.diemTichLuy >= Number(process.env.VIP_THRESHOLD_POINTS) && updatedUser.maLoaiNguoiDung !== process.env.DEFAULT_USER_ROLE_VIP) {
            await tx.nGUOIDUNG.update({
              where: { maNguoiDung: pending.maNguoiDung },
              data: { loaiNguoiDung: {
                connect: { maLoaiNguoiDung: process.env.DEFAULT_USER_ROLE_VIP}
              }},
            })
          }
        }

        return createdHoaDon
      })

      // Clean up seat holds
      for (const seat of pending.selectedSeats) {
        const key = `seathold:${pending.maSuatChieu}:${seat.maGhe}`
        await redisClient.del(key)
      }

      await redisClient.del(`pending_order:${orderId}`)
      return res.redirect(`${process.env.VNPAY_STAFF_REDIRECT_NOTIFICATION_URL}?status=success&maHoaDon=${hoaDon.maHoaDon}`)
    } catch (error) {
      console.error('Lỗi xử lý trả về VNPAY:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /staff/payments/cash
  async handleCashPayment(req: IUserRequest, res: Response) {
    try {
      const { maSuatChieu, selectedSeats, selectedFoods, tongTien, soDienThoaiNguoiDung }: IPaymentRequestBody = req.body
      const maNhanVienBanVe = req.user?.maNguoiDung

      let nguoiDung = null
      if(soDienThoaiNguoiDung){
        nguoiDung = await prisma.nGUOIDUNG.findUnique({
          where: { soDienThoai: soDienThoaiNguoiDung },
        })
      }
      
      if (!maSuatChieu || !selectedSeats?.length || !tongTien || !maNhanVienBanVe) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng.' })
      }

      // Create invoice directly without payment gateway
      const hoaDon = await prisma.$transaction(async (tx) => {
        const maHoaDon = await generateIncrementalId(tx.hOADON, 'maHoaDon', 'HD')
        const createdHoaDon = await tx.hOADON.create({
          data: {
            maHoaDon,
            maQR: customAlphabet('0123456789', 10)(),
            maNguoiDung: nguoiDung ? nguoiDung.maNguoiDung : null,
            maNhanVienBanVe,
            tongTien,
            phuongThucThanhToan: 'TIENMAT',
            hinhThucDatVe: 'Offline'
          },
        })

        const gheSuatChieuIds: string[] = []
        for (const seat of selectedSeats) {
          const gheSuatChieu = await tx.gHE_SUATCHIEU.findUnique({
            where: {
              maGhe_maSuatChieu: {
                maGhe: seat.maGhe,
                maSuatChieu,
              },
            },
          })

          if (!gheSuatChieu) {
            throw new Error(`Ghế ${seat.maGhe} không tồn tại trong suất chiếu ${maSuatChieu}`)
          }
          gheSuatChieuIds.push(gheSuatChieu.maGheSuatChieu)
          
          const maVe = await generateIncrementalId(tx.vE, 'maVe', 'VE')
          await tx.vE.create({
            data: {
              maVe,
              maGheSuatChieu: gheSuatChieu.maGheSuatChieu,
              maHoaDon,
              giaVe: seat.giaTien,
              trangThai: 'DaThanhToan',
            },
          })
        }

        // Create HOADON_COMBO and HOADON_SANPHAM
        if (selectedFoods?.length > 0) {
          const combos = selectedFoods.filter((f: any) => f.loai === 'combo')
          const sanPhams = selectedFoods.filter((f: any) => f.loai === 'sanpham')
          if (combos.length > 0) {
            await tx.hOADON_COMBO.createMany({
              data: combos.map((f: any) => ({
                maHoaDon,
                maCombo: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
            })
          }
          if (sanPhams.length > 0) {
            await tx.hOADON_SANPHAM.createMany({
              data: sanPhams.map((f: any) => ({
                maHoaDon,
                maSanPham: f.maSanPham,
                soLuong: f.soLuong,
                donGia: f.donGia,
                tongTien: f.donGia * f.soLuong,
              })),
            })
          }
        }    

        if (gheSuatChieuIds.length > 0) {
          await tx.gHE_SUATCHIEU.updateMany({
            where: { maGheSuatChieu: { in: gheSuatChieuIds } },
            data: { trangThaiGhe: 'DaDat' },
          })
        }

        if(nguoiDung){
          await tx.nGUOIDUNG.update({
            where: { maNguoiDung: nguoiDung.maNguoiDung },
            data: { diemTichLuy: { increment: Math.floor(tongTien / 1000) } },
          })
        }

        return createdHoaDon
      })

      // Clean up seat holds
      for (const seat of selectedSeats) {
        const key = `seathold:${maSuatChieu}:${seat.maGhe}`
        await redisClient.del(key)
      }

      const redirectUrl = `${process.env.VNPAY_STAFF_REDIRECT_NOTIFICATION_URL}?status=success&maHoaDon=${hoaDon.maHoaDon}`
      return res.status(200).json(redirectUrl)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /staff/payments/ticket/:maHoaDon
  async downloadTicket(req: IUserRequest, res: Response) {
    try {
      const { maHoaDon } = req.params
      await generateTicketPDF(maHoaDon, res)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new ThanhToansController()