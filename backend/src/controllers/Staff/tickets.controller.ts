import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
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
                combo: {
                  include: {
                    chiTietCombos: {
                      include: {
                        sanPham: true
                      }
                    }
                  }
                }
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
        nhanVienBanVe: hd.nhanVienBanVe ? {
          hoTen: hd.nhanVienBanVe.hoTen,
          email: hd.nhanVienBanVe.email,
          soDienThoai: hd.nhanVienBanVe.soDienThoai,
        } : null,
        nguoiDung: hd.nguoiDung ? {
          hoTen: hd.nguoiDung.hoTen,
          email: hd.nguoiDung.email,
          soDienThoai: hd.nguoiDung.soDienThoai,
        } : null,
        tongTien: hd.tongTien,
        phuongThucThanhToan: hd.phuongThucThanhToan,
        ngayThanhToan: hd.ngayThanhToan,
        hinhThucDatVe: hd.hinhThucDatVe,
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
          thoiGianLay: hc.thoiGianLay,
          chiTietCombos: hc.combo.chiTietCombos.map(ctc => ({
            maSanPham: ctc.maSanPham,
            tenSanPham: ctc.sanPham.tenSanPham,
            soLuong: ctc.soLuong,
          }))
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

  // [POST] /tickets/scan-ticket
  async scanTicket(req: IUserRequest, res: Response) {
    try {
      const { maQR } = req.body

      // Check if QR contains "-" (maHoaDon-maVe format for paper ticket)
      const isPaperTicket = maQR.includes('-')
      if (isPaperTicket) {
        const [maQRHoaDon, maVe] = maQR.split('-')
        
        const hoaDon = await prisma.hOADON.findUnique({
          where: { maQR: maQRHoaDon },
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
            }
          }
        })
        
        if (!hoaDon) {
          return res.status(404).json({ message: 'Mã QR không hợp lệ' })
        }

        // Find specific ticket
        const ve = await prisma.vE.findUnique({
          where: { maVe },
          include: {
            hoaDon: true,
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
        })

        if (!ve) {
          return res.status(404).json({ message: 'Vé không tồn tại' })
        }

        if (ve.trangThai === 'DaCheckIn') {
          return res.status(400).json({ 
            message: 'Vé này đã được check-in trước đó',
            data: {
              maHoaDon: hoaDon.maHoaDon,
              tongTien: hoaDon.tongTien,
              phuongThucThanhToan: hoaDon.phuongThucThanhToan,
              ngayThanhToan: hoaDon.ngayThanhToan,
              ves: hoaDon.ves.filter(v => v.maVe === maVe),
            }
          })
        }

        // Update only this ticket
        await prisma.vE.update({
          where: { maVe },
          data: {
            trangThai: 'DaCheckIn',
            maNhanVienSoatVe: req.user?.maNguoiDung,
            thoiGianCheckIn: new Date()
          }
        })

        return res.status(200).json({
          message: 'Check-in vé thành công',
          data: {
            maHoaDon: hoaDon.maHoaDon,
            tongTien: hoaDon.tongTien,
            phuongThucThanhToan: hoaDon.phuongThucThanhToan,
            ngayThanhToan: hoaDon.ngayThanhToan,
            ves: hoaDon.ves.filter(v => v.maVe === maVe),
          }
        })
      } else {
        // Online ticket: maHoaDon only - check all tickets in invoice
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
            }
          }
        })
        
        if (!hoaDon) {
          return res.status(404).json({ message: 'Mã QR không hợp lệ' })
        }

        const daCheckInVe = hoaDon.ves.find(v => v.trangThai === 'DaCheckIn')
        if (daCheckInVe) {
          return res.status(400).json({ 
            message: 'Vé này đã được check-in trước đó',
            data: {
              maHoaDon: hoaDon.maHoaDon,
              tongTien: hoaDon.tongTien,
              phuongThucThanhToan: hoaDon.phuongThucThanhToan,
              ngayThanhToan: hoaDon.ngayThanhToan,
              ves: hoaDon.ves,
            }
          })
        }

        // Update all tickets in invoice
        await prisma.vE.updateMany({
          where: { maHoaDon: hoaDon.maHoaDon },
          data: {
            trangThai: 'DaCheckIn',
            maNhanVienSoatVe: req.user?.maNguoiDung,
            thoiGianCheckIn: new Date()
          }
        })

        return res.status(200).json({
          message: 'Check-in thành công',
          data: {
            maHoaDon: hoaDon.maHoaDon,
            tongTien: hoaDon.tongTien,
            phuongThucThanhToan: hoaDon.phuongThucThanhToan,
            ngayThanhToan: hoaDon.ngayThanhToan,
            ves: hoaDon.ves,
          }
        })
      }
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /tickets/scan-food
  async scanFood(req: IUserRequest, res: Response) {
    try {
      const { maQR } = req.body
      
      // Food QR 
      const hoaDon = await prisma.hOADON.findUnique({
        where: { maQR },
        include: {
          hoaDonCombos: {
            include: {
              combo: {
                include: {
                  chiTietCombos: {
                    include: {
                      sanPham: true
                    }
                  }
                }
              }
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

      const hasFood = hoaDon.hoaDonSanPhams.length > 0 || hoaDon.hoaDonCombos.length > 0
      if (!hasFood) {
        return res.status(400).json({ message: 'Hóa đơn không có sản phẩm để nhận' })
      }

      const daLaySanPham = hoaDon.hoaDonSanPhams.some(v => v.daLay === true) 
      const daLayCombo   = hoaDon.hoaDonCombos.some(v => v.daLay === true)

      if (daLaySanPham || daLayCombo) {
        return res.status(400).json({ 
          message: 'Sản phẩm đã được nhận trước đó',
          data: {
            maHoaDon: hoaDon.maHoaDon,
            tongTien: hoaDon.tongTien,
            phuongThucThanhToan: hoaDon.phuongThucThanhToan,
            ngayThanhToan: hoaDon.ngayThanhToan,
            hoaDonCombos: hoaDon.hoaDonCombos,
            hoaDonSanPhams: hoaDon.hoaDonSanPhams,
          }
        })
      }

      await prisma.$transaction([
        prisma.hOADON_COMBO.updateMany({
          where: { maHoaDon: hoaDon.maHoaDon },
          data: { daLay: true, thoiGianLay: new Date(), maNhanVienSoatBapNuoc: req.user?.maNguoiDung }
        }),
        prisma.hOADON_SANPHAM.updateMany({
          where: { maHoaDon: hoaDon.maHoaDon },
          data: { daLay: true, thoiGianLay: new Date(), maNhanVienSoatBapNuoc: req.user?.maNguoiDung }
        })
      ])

      res.status(200).json({
        message: 'Nhận sản phẩm thành công',
        data: {
          maHoaDon: hoaDon.maHoaDon,
          tongTien: hoaDon.tongTien,
          phuongThucThanhToan: hoaDon.phuongThucThanhToan,
          ngayThanhToan: hoaDon.ngayThanhToan,
          hoaDonCombos: hoaDon.hoaDonCombos,
          hoaDonSanPhams: hoaDon.hoaDonSanPhams,
        }
      })
      
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new VesController()