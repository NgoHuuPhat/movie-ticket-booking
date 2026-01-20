import {  Response } from 'express'
import { IUserRequest } from '@/types/user'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'

class HoSoNguoiDungController {

  // [GET] /profile
  async getProfile(req: IUserRequest, res: Response) {
    try {
      const userId = req.user?.maNguoiDung
      const profileUser = await prisma.nGUOIDUNG.findUnique({
        where: { maNguoiDung: userId },
      })
      
      if(!profileUser) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' })
      }
      if(profileUser.hoatDong === false) {
        return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' })
      }

      res.status(200).json(profileUser)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /profile/history
  async getTransactionHistory(req: IUserRequest, res: Response) {
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

  // [PUT] /profile/password
  async updatePassword(req: IUserRequest, res: Response) {
    try {
      const userId = req.user?.maNguoiDung
      const { currentPassword, newPassword, confirmNewPassword } = req.body

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: 'Mật khẩu mới và xác nhận mật khẩu không khớp' })
      }

      const user = await prisma.nGUOIDUNG.findUnique({
        where: { maNguoiDung: userId }
      })
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.matKhau)
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' })
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.nGUOIDUNG.update({
        where: { maNguoiDung: userId },
        data: { matKhau: hashedPassword }
      })

      res.status(200).json({ message: 'Cập nhật mật khẩu thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new HoSoNguoiDungController()