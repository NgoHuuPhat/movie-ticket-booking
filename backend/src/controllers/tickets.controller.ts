import { Response } from 'express'
import { prisma } from '@/lib/prisma'
import { IUserRequest } from '@/types/user'

class VesController {

  // [GET] /api/tickets/history
  async getInvoicesWithDetails(req: IUserRequest, res: Response) {
    try {
      const maNguoiDung = req.user?.maNguoiDung

      const hoaDons = await prisma.hOADON.findMany({
        where: { maNguoiDung: maNguoiDung },
        include: {
          khuyenMai: {
            select: {
              tenKhuyenMai: true,
              maCode: true,
              loaiKhuyenMai: true,
              giaTriGiam: true
            }
          },
          nhanVienBanVe: {
            select: {
              hoTen: true
            }
          },
          ves: {
            include: {
              gheSuatChieu: {
                include: {
                  ghe: {
                    include: {
                      loaiGhe: true,
                      phongChieu: {
                        include: {
                          rap: true
                        }
                      }
                    }
                  },
                  suatChieu: {
                    include: {
                      phim: {
                        select: {
                          tenPhim: true,
                          anhBia: true,
                          phienBan: true,
                          ngonNgu: true
                        }
                      }
                    }
                  }
                }
              },
              nhanVienSoatVe: {
                select: {
                  hoTen: true
                }
              }
            }
          },
          hoaDonCombos: {
            include: {
              combo: {
                select: {
                  tenCombo: true,
                  anhCombo: true
                }
              },
              nhanVienSoatBapNuoc: {
                select: {
                  hoTen: true
                }
              }
            }
          },
          hoaDonSanPhams: {
            include: {
              sanPham: {
                select: {
                  tenSanPham: true,
                  anhSanPham: true
                }
              },
              nhanVienSoatBapNuoc: {
                select: {
                  hoTen: true
                }
              }
            }
          }
        },
        orderBy: {
          ngayThanhToan: 'desc'
        }
      })

      return res.status(200).json(hoaDons)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new VesController()