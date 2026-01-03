import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { customAlphabet } from 'nanoid'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { getDayRange } from '@/utils/date.utils'

class MaKhuyenMaisController {

  // [GET] /admin/discounts
  async getAllDiscounts(req: Request, res: Response) {
    try {
      const { hoatDong, trangThai, loaiKhuyenMai, doiTuongKhuyenMai, search, page = 1, sortField = 'maKhuyenMai', sortOrder = 'desc' } = req.query
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string
      const { startDate, endDate } = getDayRange()
      
      if (hoatDong !== undefined) {
        filter.hoatDong = hoatDong === 'true'
      }
      if (loaiKhuyenMai) {
        filter.loaiKhuyenMai = loaiKhuyenMai
      }
      if(trangThai === 'dangHoatDong') {
        filter.ngayBatDau = { lte: endDate }
        filter.ngayKetThuc = { gte: startDate }
      }
      if(trangThai === 'sapDienRa') {
        filter.ngayBatDau = { gt: endDate }
      }
      if(trangThai === 'daKetThuc') {
        filter.ngayKetThuc = { lt: startDate }
      }
      if(doiTuongKhuyenMai) {
        filter.maLoaiNguoiDung = doiTuongKhuyenMai
      }
      if (search) {
        filter.OR = [
          { tenKhuyenMai: { contains: String(search), mode: 'insensitive' } },
          { maCode: { contains: String(search), mode: 'insensitive' } }
        ]
      }

      const [discounts, total] = await Promise.all([
        prisma.kHUYENMAI.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.kHUYENMAI.count({ where: filter })
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      return res.status(200).json({ discounts, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/discounts/stats
  async getDiscountStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = getDayRange()
      const [ totalDiscount, activeCount, upcomingCount, expiredCount ] = await Promise.all([
        prisma.kHUYENMAI.count(),
        prisma.kHUYENMAI.count({
          where: {
            ngayBatDau: { lte: endDate },
            ngayKetThuc: { gte: startDate }
          }
        }),
        prisma.kHUYENMAI.count({
          where: {
            ngayBatDau: { gt: endDate }
          }
        }),
        prisma.kHUYENMAI.count({
          where: {
            ngayKetThuc: { lte: startDate }
          }
        }),
      ])

      return res.status(200).json({ totalDiscount, activeCount, upcomingCount, expiredCount })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/discounts
  async createDiscount(req: Request, res: Response) {
    try {
      const { tenKhuyenMai, loaiKhuyenMai, giaTriGiam, giamToiDa, 
        donHangToiThieu, maLoaiNguoiDung, soLuong, ngayBatDau, ngayKetThuc, moTa
      } = req.body
      const nanoid = customAlphabet('0123456789', 8)
      const maCode = `KM${nanoid()}`
      const maKhuyenMai = await generateIncrementalId(prisma.kHUYENMAI, 'maKhuyenMai', 'KM')

      const newDiscount = await prisma.kHUYENMAI.create({ 
        data: {
          maKhuyenMai,
          tenKhuyenMai,
          maCode,
          loaiKhuyenMai,
          giaTriGiam,
          giamToiDa,
          donHangToiThieu,
          maLoaiNguoiDung,
          soLuong,
          ngayBatDau: new Date(ngayBatDau),
          ngayKetThuc: new Date(ngayKetThuc),
          moTa
        }
      })
        
      return res.status(201).json({message: 'Tạo mã khuyến mãi thành công', newDiscount})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/discounts/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { discountIds, action } = req.body
      switch(action) {
        case 'hoatDong':
          await prisma.kHUYENMAI.updateMany({
            where: { maKhuyenMai: { in: discountIds } },
            data: { hoatDong: true }
          })
          res.status(200).json({ message: 'Kích hoạt khuyến mãi thành công' })
          break
        case 'ngungHoatDong':
          await prisma.kHUYENMAI.updateMany({
            where: { maKhuyenMai: { in: discountIds } },
            data: { hoatDong: false }
          })
          res.status(200).json({ message: 'Ngừng kích hoạt khuyến mãi thành công' })
          break
        case 'xoa':
          await prisma.kHUYENMAI.deleteMany({
            where: { maKhuyenMai: { in: discountIds } }
          })
          res.status(200).json({ message: 'Xóa khuyến mãi thành công' })
          break
        default:
          res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/discounts/:id/toggle
  async toggleDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params
      const discount = await prisma.kHUYENMAI.findUnique({
        where: { maKhuyenMai: id }
      })
      if (!discount) {
        return res.status(404).json({ message: 'Mã khuyến mãi không tồn tại' })
      }
      const updatedDiscount = await prisma.kHUYENMAI.update({
        where: { maKhuyenMai: id },
        data: { hoatDong: !discount.hoatDong }
      })
      return res.status(200).json({message: 'Cập nhật trạng thái thành công', updatedDiscount})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/discounts/:id
  async updateDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenKhuyenMai, loaiKhuyenMai, giaTriGiam, giamToiDa, 
        donHangToiThieu, maLoaiNguoiDung, soLuong, ngayBatDau, ngayKetThuc, moTa
      } = req.body
      const updatedDiscount = await prisma.kHUYENMAI.update({
        where: { maKhuyenMai: id },
        data: {
          tenKhuyenMai,
          loaiKhuyenMai,
          giaTriGiam,
          giamToiDa,
          donHangToiThieu,
          maLoaiNguoiDung,
          soLuong,
          ngayBatDau: new Date(ngayBatDau),
          ngayKetThuc: new Date(ngayKetThuc),
          moTa
        }
      })
      
      return res.status(200).json({message: 'Cập nhật khuyến mãi thành công', updatedDiscount})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/discounts/:id
  async deleteDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.kHUYENMAI.delete({
        where: { maKhuyenMai: id },
      })

      return res.status(200).json({ message: 'Xóa mã khuyến mãi thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new MaKhuyenMaisController()