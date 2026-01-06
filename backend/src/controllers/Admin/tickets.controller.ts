import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { tr } from 'date-fns/locale'

class VesController {

  // [GET] /admin/tickets
  async getInvoicesWithDetails(req: Request, res: Response) {
    try {
      const { thanhToan, phim, date, hinhThuc, search, page = 1, sortField = 'maHoaDon', sortOrder = 'desc' } = req.query

      const limit = 10
      const skip = (Number(page) - 1) * limit
      const where: any = {}
      const sortFields = sortField as string

      // Filters
      if (thanhToan === 'daThanhToan') {
        where.trangThaiThanhToan = 'DaThanhToan'
      } else if (thanhToan === 'chuaThanhToan') {
        where.trangThaiThanhToan = 'ChuaThanhToan'
      }

      if (hinhThuc === 'online') {
        where.hinhThucDatVe = 'Online'
      } else if (hinhThuc === 'offline') {
        where.hinhThucDatVe = 'Offline'
      }

      if(phim){
        where.ves = {
          some: {
            gheSuatChieu: {
              suatChieu: {
                maPhim: phim
              }
            }
          }
        }
      }

      if(date) {
        const startOfDay = new Date(date as string)
        startOfDay.setHours(0,0,0,0)
        const endOfDay = new Date(date as string)
        endOfDay.setHours(23,59,59,999)
        where.ngayThanhToan = { gte: startOfDay, lt: endOfDay }
      }

      if (search) {
        where.OR = [
          { maHoaDon: { contains: search, mode: 'insensitive' } },
          { maQR: { contains: search, mode: 'insensitive' } },
          { nguoiDung: { hoTen: { contains: search, mode: 'insensitive' } } },
        ]
      }

      const [invoices, total] = await Promise.all([
        prisma.hOADON.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortFields]: sortOrder },
          include: {
            nguoiDung: true,
            nhanVienBanVe: true,
            ves: {
              include: {
                gheSuatChieu: { 
                  include: {
                    ghe: true,
                    suatChieu: {
                      include: {
                        phim: true,
                        phongChieu: true,
                      }
                    }
                  }
                },
                nhanVienSoatVe: true
              }
            },
            hoaDonCombos: {
              include: {
                combo: true,
                nhanVienSoatBapNuoc: true
              }
            },
            hoaDonSanPhams: {
              include: {
                sanPham: true,
                nhanVienSoatBapNuoc: true
              }
            }
          }
        }),
        prisma.hOADON.count({ where })
      ])

      // Format data
      const formatted = invoices.map(hd => ({
        maHoaDon: hd.maHoaDon,
        maQR: hd.maQR,
        maNguoiDung: hd.maNguoiDung,
        nguoiDung: hd.nguoiDung ? {
          hoTen: hd.nguoiDung.hoTen,
          email: hd.nguoiDung.email,
          soDienThoai: hd.nguoiDung.soDienThoai,
        } : null,
        nhanVienBanVe: hd.nhanVienBanVe ? {
          hoTen: hd.nhanVienBanVe.hoTen,
          email: hd.nhanVienBanVe.email,
          soDienThoai: hd.nhanVienBanVe.soDienThoai,
        } : null,
        nhanVienSoatVe: hd.ves.map(v => v.nhanVienSoatVe ? {
          hoTen: v.nhanVienSoatVe.hoTen,
          email: v.nhanVienSoatVe.email,
          soDienThoai: v.nhanVienSoatVe.soDienThoai,
        } : null),
        tongTien: hd.tongTien,
        phuongThucThanhToan: hd.phuongThucThanhToan,
        ngayThanhToan: hd.ngayThanhToan,
        hinhThuc: hd.hinhThucDatVe,
        maKhuyenMai: hd.maKhuyenMai,
        ves: hd.ves.map(v => ({
          maVe: v.maVe,
          giaVe: v.giaVe,
          trangThai: v.trangThai,
          thoiGianCheckIn: v.thoiGianCheckIn,
          nhanVienSoatVe: v.nhanVienSoatVe ? {
            hoTen: v.nhanVienSoatVe.hoTen,
            email: v.nhanVienSoatVe.email,
            soDienThoai: v.nhanVienSoatVe.soDienThoai,
          } : null,
          suatChieu: {
            maSuatChieu: v.gheSuatChieu.suatChieu.maSuatChieu,
            gioBatDau: v.gheSuatChieu.suatChieu.gioBatDau,
            phongChieu: { tenPhong: v.gheSuatChieu.suatChieu.phongChieu.tenPhong },
            phim: { tenPhim: v.gheSuatChieu.suatChieu.phim.tenPhim }
          },
          ghe: [v.gheSuatChieu.ghe.hangGhe + v.gheSuatChieu.ghe.soGhe]
        })),
        combos: hd.hoaDonCombos.map(hc => ({
          maCombo: hc.maCombo,
          tenCombo: hc.combo.tenCombo,
          soLuong: hc.soLuong,
          donGia: hc.donGia,
          tongTien: hc.tongTien,
          daLay: hc.daLay,
          thoiGianLay: hc.thoiGianLay,
          nhanVienSoatBapNuoc: hc.nhanVienSoatBapNuoc ? {
            hoTen: hc.nhanVienSoatBapNuoc.hoTen,
            email: hc.nhanVienSoatBapNuoc.email,
            soDienThoai: hc.nhanVienSoatBapNuoc.soDienThoai,
          } : null
        })),
        sanPhams: hd.hoaDonSanPhams.map(hs => ({
          maSanPham: hs.maSanPham,
          tenSanPham: hs.sanPham.tenSanPham,
          soLuong: hs.soLuong,
          donGia: hs.donGia,
          tongTien: hs.tongTien,
          daLay: hs.daLay,
          thoiGianLay: hs.thoiGianLay,
          nhanVienSoatBapNuoc: hs.nhanVienSoatBapNuoc ? {
            hoTen: hs.nhanVienSoatBapNuoc.hoTen,
            email: hs.nhanVienSoatBapNuoc.email,
            soDienThoai: hs.nhanVienSoatBapNuoc.soDienThoai,
          } : null
        }))
      }))
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      return res.status(200).json({ invoices: formatted, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)), })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/tickets/stats
  async getTicketStats(req: Request, res: Response) {
    try {
      const [totalTickets, onlineTickets, offlineTickets, totalRevenue] =
        await Promise.all([
          prisma.hOADON.count(),
          prisma.hOADON.count({
            where: { phuongThucThanhToan: { in: ['VNPAY', 'MOMO'] } },
          }),
          prisma.hOADON.count({ where: { phuongThucThanhToan: 'TIENMAT' } }),
          prisma.hOADON.aggregate({ _sum: { tongTien: true } }),
        ])

      return res.status(200).json({
        totalTickets,
        onlineTickets,
        offlineTickets,
        totalRevenue: totalRevenue._sum.tongTien || 0,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new VesController()