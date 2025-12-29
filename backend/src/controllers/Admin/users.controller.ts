
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import validator from 'validator'
import bcrypt from 'bcrypt'
import { IUserRequest } from '@/types/user'

class NguoiDungsController {

  // [GET] /admin/users
  async getAllUsers(req: IUserRequest, res: Response) {
    try {
      const { hoatDong, search, maLoaiNguoiDung, page = 1, sortField = 'maNguoiDung', sortOrder = 'asc' } = req.query
      const currentAdminId = req.user?.maNguoiDung
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string

      if(hoatDong !== undefined){
        filter.hoatDong = hoatDong === 'true'
      }

      if(maLoaiNguoiDung) {
        filter.maLoaiNguoiDung = maLoaiNguoiDung
      }

      if(search) {
        filter.OR = [
          { hoTen: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { soDienThoai: { contains: search as string, mode: 'insensitive' } },
        ]
      }

      if(currentAdminId) {
        filter.maNguoiDung = { not: currentAdminId }
      }

      const [users, total] = await Promise.all([
        prisma.nGUOIDUNG.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: {
            loaiNguoiDung: true
          }
        }),
        prisma.nGUOIDUNG.count({ where: filter })
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)
      
      res.status(200).json({ users, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/users/stats
  async getUserStats(req: Request, res: Response) {
    try {
      const [totalUsers, activeUsers, inactiveUsers, customerUsers, vipUsers, staffUsers] = await Promise.all([
        prisma.nGUOIDUNG.count(),
        prisma.nGUOIDUNG.count({ where: { hoatDong: true } }),
        prisma.nGUOIDUNG.count({ where: { hoatDong: false } }),
        prisma.nGUOIDUNG.count({ where: { maLoaiNguoiDung: process.env.DEFAULT_USER_ROLE_KH } }),
        prisma.nGUOIDUNG.count({ where: { maLoaiNguoiDung: process.env.DEFAULT_USER_ROLE_VIP } }),
        prisma.nGUOIDUNG.count({ where: { maLoaiNguoiDung: process.env.DEFAULT_USER_ROLE_NV } }),
      ])

      res.status(200).json({ totalUsers, activeUsers, inactiveUsers, customerUsers, vipUsers, staffUsers })
    } catch (error) {
      
    }
  }

  // [POST] /admin/users
  async createUser(req: Request, res: Response) {
    try {
      const { hoTen, email, matKhau, soDienThoai, gioiTinh } = req.body
      const ngaySinh = new Date(req.body.ngaySinh)

      if(!process.env.DEFAULT_USER_ROLE_NV) {
        return res.status(500).json({ message: 'Server configuration error' })
      }

      const existingUser = await prisma.nGUOIDUNG.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' })
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ' })
      }

      const existingPhone = await prisma.nGUOIDUNG.findUnique({ where: { soDienThoai } })
      if (existingPhone) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' })
      }
      if (!validator.isMobilePhone(soDienThoai, 'vi-VN')) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
      }

      if (matKhau.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      }
      const hashedPassword = await bcrypt.hash(matKhau, 10)
      const maNguoiDung = await generateIncrementalId(prisma.nGUOIDUNG, 'maNguoiDung', 'ND')
      const newUser = await prisma.nGUOIDUNG.create({
        data: {
          maNguoiDung,
          hoTen,
          email,
          matKhau: hashedPassword,
          soDienThoai,
          maLoaiNguoiDung: process.env.DEFAULT_USER_ROLE_NV,
          ngaySinh,
          gioiTinh,
        },
        include: { loaiNguoiDung: true }
      })
      res.status(201).json({message: 'Tạo người dùng thành công', newUser})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/users/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { userIds, action } = req.body
      switch(action) {
        case 'moKhoa':
          await prisma.nGUOIDUNG.updateMany({
            where: { maNguoiDung: { in: userIds } },
            data: { hoatDong: true }
          })
          res.status(200).json({ message: 'Mở hoạt động người dùng thành công' })
          break
        case 'khoa':
          await prisma.nGUOIDUNG.updateMany({
            where: { maNguoiDung: { in: userIds } },
            data: { hoatDong: false }
          })
          res.status(200).json({ message: 'Khóa người dùng thành công' })
          break
        case 'xoa':
          await prisma.nGUOIDUNG.deleteMany({
            where: { maNguoiDung: { in: userIds } }
          })
          res.status(200).json({ message: 'Xóa người dùng thành công' })
          break
        default:
          res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/users/:id/status
  async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { hoatDong } = req.body

      const user = await prisma.nGUOIDUNG.findUnique({ where: { maNguoiDung: id } })
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' })
      }

      await prisma.nGUOIDUNG.update({
        where: { maNguoiDung: id },
        data: { hoatDong: !hoatDong },
      })

      res.status(200).json({ message: 'Cập nhật trạng thái người dùng thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
  // [DELETE] /admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.nGUOIDUNG.delete({
        where: { maNguoiDung: id },
      })
      res.status(204).json({message: 'Xóa người dùng thành công'})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new NguoiDungsController()