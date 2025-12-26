import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { toZonedTime } from 'date-fns-tz'
import { IUserRequest } from '@/types/user'

class VesController {

  // [GET] /api/tickets
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
        where.phuongThucThanhToan = { in: ['VNPAY', 'MOMO'] }
      } else if (hinhThuc === 'offline') {
        where.phuongThucThanhToan = 'TIENMAT'
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
        console.log("date filter in backend:", date)
        const VN_TZ = 'Asia/Ho_Chi_Minh'
        const startOfDayUtc = toZonedTime(date as string, VN_TZ)
        startOfDayUtc.setHours(0,0,0,0)
        const endOfDayUtc = toZonedTime(date as string, VN_TZ)
        endOfDayUtc.setHours(23,59,59,999)
        where.ngayThanhToan = { gte: startOfDayUtc, lt: endOfDayUtc }
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
            nhanVienDat: true,
            ves: {
              include: {
                gheSuatChieu: {
                  include: {
                    ghe: true,
                    suatChieu: {
                      include: {
                        phim: {
                          include: {
                            phanLoaiDoTuoi: true
                          }
                        },
                        phongChieu: true,
                      }
                    }
                  }
                }
              }
            },
            hoaDonCombos: {
              include: {
                combo: true
              }
            },
            hoaDonSanPhams: {
              include: {
                sanPham: true
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
        nhanVienDat: hd.nhanVienDat ? {
          hoTen: hd.nhanVienDat.hoTen,
          email: hd.nhanVienDat.email,
          soDienThoai: hd.nhanVienDat.soDienThoai,
        } : null,
        nguoiDung: {
          hoTen: hd.nguoiDung.hoTen,
          email: hd.nguoiDung.email,
          soDienThoai: hd.nguoiDung.soDienThoai,
        },
        tongTien: hd.tongTien,
        phuongThucThanhToan: hd.phuongThucThanhToan,
        ngayThanhToan: hd.ngayThanhToan,
        hinhThuc: hd.phuongThucThanhToan === 'TIENMAT' ? 'Offline' : 'Online',
        maKhuyenMai: hd.maKhuyenMai,
        ves: hd.ves.map(v => ({
          maVe: v.maVe,
          giaVe: v.giaVe,
          trangThai: v.trangThai,
          thoiGianCheckIn: v.thoiGianCheckIn,
          suatChieu: {
            maSuatChieu: v.gheSuatChieu.suatChieu.maSuatChieu,
            gioBatDau: v.gheSuatChieu.suatChieu.gioBatDau,
            phongChieu: { tenPhong: v.gheSuatChieu.suatChieu.phongChieu.tenPhong },
            phim: { tenPhim: v.gheSuatChieu.suatChieu.phim.tenPhim },
            tenPhanLoaiDoTuoi: v.gheSuatChieu.suatChieu.phim.phanLoaiDoTuoi.tenPhanLoaiDoTuoi
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
          thoiGianLay: hc.thoiGianLay
        })),
        sanPhams: hd.hoaDonSanPhams.map(hs => ({
          maSanPham: hs.maSanPham,
          tenSanPham: hs.sanPham.tenSanPham,
          soLuong: hs.soLuong,
          donGia: hs.donGia,
          tongTien: hs.tongTien,
          daLay: hs.daLay,
          thoiGianLay: hs.thoiGianLay
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

  // [POST] /tickets/scan
  async scanTicket(req: IUserRequest, res: Response) {
    try {
      const { maQR } = req.body
      const maNhanVienSoat = req.user?.maNguoiDung

      const hoaDon = await prisma.hOADON.findUnique({
        where: { maQR },
        include: {
          ves: {
            include: {
              gheSuatChieu: {
                include: {
                  ghe: true,  
                  suatChieu: {
                    include: {
                      phim: true,
                      phongChieu: true
                    }
                  }
                }
              }
            }
          },
          hoaDonCombos: {
            include: {
              combo: true 
            }
          },
          hoaDonSanPhams: {
            include: {
              sanPham: true  
            }
          }
        }
      })
      
      if (!hoaDon) {
        return res.status(404).json({ message: 'Mã QR không hợp lệ' })
      }

      const daCheckInVe = hoaDon.ves.find(v => v.trangThai === 'DaCheckIn')
      if(daCheckInVe) {
        return res.status(400).json({ 
          message: `Vé đã được check-in trước đó.`, 
          data: {
            maHoaDon: hoaDon.maHoaDon,
            tongTien: hoaDon.tongTien,
            phuongThucThanhToan: hoaDon.phuongThucThanhToan,
            ngayThanhToan: hoaDon.ngayThanhToan,
            ves: hoaDon.ves,
            combos: hoaDon.hoaDonCombos,
            sanPhams: hoaDon.hoaDonSanPhams
          }
        })
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.vE.updateMany({
          where: { maHoaDon: hoaDon.maHoaDon },
          data: {
            trangThai: 'DaCheckIn',
            thoiGianCheckIn: new Date(),
            maNhanVienSoat
          }
        })

        if(hoaDon.hoaDonCombos.length > 0) {
          await prisma.hOADON_COMBO.updateMany({
            where: { maHoaDon: hoaDon.maHoaDon, daLay: false },
            data: { daLay: true, thoiGianLay: new Date() }
          })
        }
        if(hoaDon.hoaDonSanPhams.length > 0) {
          await prisma.hOADON_SANPHAM.updateMany({
            where: { maHoaDon: hoaDon.maHoaDon, daLay: false },
            data: { daLay: true, thoiGianLay: new Date() }
          })
        }
      })

      res.status(200).json({
        message: 'Check-in vé thành công',
        data: {
          maHoaDon: hoaDon.maHoaDon,
          tongTien: hoaDon.tongTien,
          phuongThucThanhToan: hoaDon.phuongThucThanhToan,
          ngayThanhToan: hoaDon.ngayThanhToan,
          ves: hoaDon.ves,
          combos: hoaDon.hoaDonCombos,
          sanPhams: hoaDon.hoaDonSanPhams
        }
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new VesController()