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
    const { maSuatChieu, selectedSeats, selectedFoods, maCodeKhuyenMai, tongTien }: IVNPayRequestBody = req.body
    const maNguoiDung = req.user?.maNguoiDung
    if (!maSuatChieu || !selectedSeats?.length || !tongTien || !maNguoiDung) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo đơn hàng.' })
    }

    // Extend time seat hold
    for (const seat of selectedSeats) {
      const key = `seathold:${maSuatChieu}:${seat.maGhe}`
      const holder = await redisClient.get(key)
      if (holder === maNguoiDung) {
        await redisClient.expire(key, 5 * 60) 
      }
    }

    const orderId = `ORDER-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12)()}`

    if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET || !process.env.VNPAY_RETURN_URL) {
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

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: tongTien,
      vnp_IpAddr: '127.0.0.1',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toán hóa đơn vé xem phim: ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 5 * 60 * 1000)),
    })

    await redisClient.set(
      `pending_order:${orderId}`,
      JSON.stringify({
        maNguoiDung,
        maSuatChieu,
        selectedSeats,
        selectedFoods: selectedFoods || [],
        maCodeKhuyenMai,
        tongTien,
        createdAt: new Date().toISOString(),
      }),
      'EX', 15 * 60
    )

    return res.status(201).json(vnpayResponse)
  }

  // [GET] /payments/vnpay/vnpay-return
  async handleVNPayReturn(req: Request, res: Response) {
    try {
      const { vnp_ResponseCode, vnp_TxnRef, vnp_PayDate } = req.query as {
        vnp_ResponseCode: string
        vnp_TxnRef: string
        vnp_PayDate: string
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
            if (holder === pending.maNguoiDung) {
              await redisClient.del(key)
            }
          }
        }
        await redisClient.del(`pending_order:${orderId}`)
        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
      }

      if (!pending) {
        console.warn(`Không tìm thấy pending order cho ${orderId}`)
        return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed&reason=expired`)
      }

      const parseVnpPayDate = (dateStr: string) => {
        const year = dateStr.substring(0, 4)
        const month = dateStr.substring(4, 6)
        const day = dateStr.substring(6, 8)
        const hour = dateStr.substring(8, 10)
        const minute = dateStr.substring(10, 12)
        const second = dateStr.substring(12, 14)
        return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`)
      }
      const ngayThanhToan = parseVnpPayDate(vnp_PayDate)

      const hoaDon = await prisma.$transaction(async (tx) => {
        const maHoaDon = await generateIncrementalId(tx.hOADON, 'maHoaDon', 'HD')

        // Handle promotion
        let maKhuyenMai: string | null = null
        if (pending.maCodeKhuyenMai) {
          const km = await tx.kHUYENMAI.findUnique({
            where: { maCode: pending.maCodeKhuyenMai },
            select: { maKhuyenMai: true },
          })
          if (km) maKhuyenMai = km.maKhuyenMai
        }

        // create HOADON
        const createdHoaDon = await tx.hOADON.create({
          data: {
            maHoaDon,
            maQR: customAlphabet('0123456789', 10)(),
            maNguoiDung: pending.maNguoiDung,
            maGiaoDich: orderId,
            maKhuyenMai,
            tongTien: pending.tongTien,
            phuongThucThanhToan: 'VNPAY',
            ngayThanhToan,
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

        await tx.nGUOIDUNG.update({
          where: { maNguoiDung: pending.maNguoiDung },
          data: { diemTichLuy: { increment: Math.floor(pending.tongTien / 1000) } },
        })

        return createdHoaDon
      })

      for (const seat of pending.selectedSeats) {
        const key = `seathold:${pending.maSuatChieu}:${seat.maGhe}`
        await redisClient.del(key)
      }

      await redisClient.del(`pending_order:${orderId}`)

      // Send email
      const fullHoaDon = await prisma.hOADON.findUnique({
        where: { maHoaDon: hoaDon.maHoaDon },
        include: {
          nguoiDung: { select: { email: true } },
          khuyenMai: true,
          ves: {
            include: {
              gheSuatChieu: {
                include: {
                  ghe: true,
                  suatChieu: {
                    include: { phim: true, phongChieu: true },
                  },
                },
              },
            },
          },
          hoaDonCombos: { include: { combo: true } },
          hoaDonSanPhams: { include: { sanPham: true } },
        },
      })

      if (!fullHoaDon) throw new Error('Không tìm thấy hóa đơn sau khi tạo')

      const qrBase64 = await QRCode.toDataURL(fullHoaDon.maQR)

      const firstVe = fullHoaDon.ves[0]
      const phim = firstVe.gheSuatChieu.suatChieu.phim
      const suatChieu = firstVe.gheSuatChieu.suatChieu
      const phongChieu = suatChieu.phongChieu

      const tienVe = fullHoaDon.ves.reduce((sum, ve) => sum + Number(ve.giaVe), 0)
      const tienCombo =
        (fullHoaDon.hoaDonCombos?.reduce((sum, c) => sum + Number(c.tongTien), 0) || 0) +
        (fullHoaDon.hoaDonSanPhams?.reduce((sum, s) => sum + Number(s.tongTien), 0) || 0)

      const tongTienTruocGiam = tienVe + tienCombo

      let soTienGiamGia = 0
      if (fullHoaDon.khuyenMai && fullHoaDon.maKhuyenMai) {
        if (fullHoaDon.khuyenMai.loaiKhuyenMai === 'GiamPhanTram') {
          soTienGiamGia = Math.floor(tongTienTruocGiam * (Number(fullHoaDon.khuyenMai.giaTriGiam) / 100))
        } else if (fullHoaDon.khuyenMai.loaiKhuyenMai === 'GiamGiaTien') {
          soTienGiamGia = Number(fullHoaDon.khuyenMai.giaTriGiam)
        }
      }

      const ticketData = {
        maQR: fullHoaDon.maQR,
        tenPhim: phim.tenPhim,
        phongChieu: phongChieu.tenPhong,
        ngayChieu: new Date(suatChieu.gioBatDau).toLocaleDateString('vi-VN'),
        gioChieu: new Date(suatChieu.gioBatDau).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        ghe: fullHoaDon.ves.map((ve) => {
          const ghe = ve.gheSuatChieu.ghe
          return `${ghe.hangGhe}${ghe.soGhe}`
        }),
        thoiGianThanhToan: ngayThanhToan.toLocaleString('vi-VN'),
        tienComboBapNuoc: tienCombo,
        soTienGiamGia: fullHoaDon.maKhuyenMai ? soTienGiamGia : 0,
        tongTien: tongTienTruocGiam,
        soTienThanhToan: Number(fullHoaDon.tongTien),
      }

      const subject = `Thông tin đặt vé xem phim - ${phim.tenPhim} - Lê Độ Cinema`
      await addTicketEmailToQueue(fullHoaDon.nguoiDung!.email, subject, ticketData, qrBase64)

      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=success`)
    } catch (error) {
      console.error('Lỗi xử lý trả về VNPAY:', error)
      return res.redirect(`${process.env.VNPAY_REDIRECT_NOTIFICATION_URL}?status=failed`)
    }
  }
}

export default new ThanhToansController()