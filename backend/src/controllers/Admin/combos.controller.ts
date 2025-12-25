import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { parseS3Url } from '@/utils/s3.utils'
import { deleteFromS3 } from '@/services/s3.service'

class CombosController {

  // [GET] /admin/combos
  async getAllCombo(req: Request, res: Response) {
    try {
      const { hienThi, search, page = 1, sortField = 'maCombo', sortOrder = 'asc' } = req.query
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string

      if(hienThi !== undefined) {
        filter.hienThi = hienThi === 'true'
      }

      if(search) {
        filter.tenCombo = {
          contains: search as string,
          mode: 'insensitive',
        }
      }
      
      const [combos, total] = await Promise.all([
        prisma.cOMBO.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: { chiTietCombos: { include: { sanPham: { select: { maSanPham: true, tenSanPham: true, giaTien: true, anhSanPham: true } } } } },
        }),
        prisma.cOMBO.count({ where: filter }),
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)
      
      return res.status(200).json({ combos, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy combo', error })
    }
  }

  // [POST] /admin/combos
  async createCombo(req: Request, res: Response) {
    try {
      const { tenCombo, giaGoc, giaBan } = req.body
      const chiTietCombos = JSON.parse(req.body.chiTietCombos)
      const anhCombo = req.body.imageUrl
      if(!anhCombo) {
        return res.status(400).json({ message: 'Ảnh combo là bắt buộc' })
      }
      if(Array.isArray(chiTietCombos) && chiTietCombos.length === 0) {
        return res.status(400).json({ message: 'Combo phải có ít nhất 1 sản phẩm' })
      }

      const productIds = chiTietCombos.map((item: any) => item.maSanPham)
      const products = await prisma.sANPHAM.findMany({
        where: { maSanPham: { in: productIds } },
        select: { maSanPham: true }
      })
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'Một hoặc nhiều sản phẩm không tồn tại' })
      }

      const maCombo = await generateIncrementalId(prisma.cOMBO, 'maCombo', 'CB')
      const newCombo = await prisma.cOMBO.create({
        data: {
          maCombo,
          tenCombo,
          anhCombo,
          giaGoc: Number(giaGoc),
          giaBan: Number(giaBan),
          chiTietCombos: {
            create: chiTietCombos.map((item: any) => ({
              maSanPham: item.maSanPham,
              soLuong: Number(item.soLuong),
            })),
          },
        },
        include: { chiTietCombos: { include: { sanPham: true } } },
      })
      res.status(201).json({ message: 'Tạo combo thành công', newCombo })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi tạo combo', error })
    }
  }

  // [POST] /admin/combos/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { action, comboIds } = req.body

      switch (action) {
        case 'xoa':
          const combosToDelete = await prisma.cOMBO.findMany({
            where: { maCombo: { in: comboIds } },
            select: { anhCombo: true }
          })
          for (const combo of combosToDelete) {
            if (combo.anhCombo) {
              const { folderName, fileName } = parseS3Url(combo.anhCombo)
              await deleteFromS3(folderName, fileName)
            }
          }

          await prisma.cOMBO.deleteMany({
            where: { maCombo: { in: comboIds } }
          })
          return res.status(200).json({ message: 'Xóa combo thành công' })
        case 'hienThi':
          await prisma.cOMBO.updateMany({
            where: { maCombo: { in: comboIds } },
            data: { hienThi: true }
          })
          return res.status(200).json({ message: 'Hiển thị combo thành công' })
        case 'an':
          await prisma.cOMBO.updateMany({
            where: { maCombo: { in: comboIds } },
            data: { hienThi: false }
          })
          return res.status(200).json({ message: 'Ẩn combo thành công' })
        default:
          return res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi thực hiện bulk action', error })
    }
  }

  // [PATCH] /admin/combos/:id
  async updateCombo(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingCombo = await prisma.cOMBO.findUnique({
        where: { maCombo: id },
      })
      if (!existingCombo) {
        return res.status(404).json({ message: 'Combo không tồn tại' })
      }
      const { tenCombo, giaGoc, giaBan } = req.body
      console.log(req.body)
      const chiTietCombos = JSON.parse(req.body.chiTietCombos)
      const anhCombo = req.body.imageUrl 

      if(anhCombo && anhCombo !== existingCombo.anhCombo) {
        const { folderName, fileName } = parseS3Url(existingCombo.anhCombo)
        await deleteFromS3(folderName, fileName)
      } else {
        req.body.anhCombo = existingCombo.anhCombo
      }

      const updatedCombo = await prisma.cOMBO.update({
        where: { maCombo: id },
        data: {
          tenCombo,
          anhCombo,
          giaGoc: Number(giaGoc),
          giaBan: Number(giaBan),
          chiTietCombos: {
            deleteMany: {},
            create: chiTietCombos.map((item: any) => ({
              maSanPham: item.maSanPham,
              soLuong: Number(item.soLuong),
            })),
          },
        },
        include: { chiTietCombos: { include: { sanPham: { select: { maSanPham: true, tenSanPham: true, giaTien: true, anhSanPham: true } } } } },
      })

      res.status(200).json({ message: 'Cập nhật combo thành công', updatedCombo })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật combo', error })
    }
  }

  // [PATCH] /admin/combos/:id/show
  async toggleShowCombo(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingCombo = await prisma.cOMBO.findUnique({
        where: { maCombo: id },
      })
      if (!existingCombo) {
        return res.status(404).json({ message: 'Combo không tồn tại' })
      }
      const updatedCombo = await prisma.cOMBO.update({
        where: { maCombo: id },
        data: { hienThi: !existingCombo.hienThi },
      })

      res.status(200).json({ message: 'Cập nhật trạng thái hiển thị combo thành công', updatedCombo })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái hiển thị combo', error })
    }
  }

  // [DELETE] /admin/combos/:id
  async deleteCombo(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingCombo = await prisma.cOMBO.findUnique({
        where: { maCombo: id },
      })
      if (!existingCombo) {
        return res.status(404).json({ message: 'Combo không tồn tại' })
      }
      const { folderName, fileName } = parseS3Url(existingCombo.anhCombo)
      await deleteFromS3(folderName, fileName)
      
      await prisma.cOMBO.delete({
        where: { maCombo: id },
      })

      res.status(200).json({ message: 'Xóa combo thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi xóa combo', error })
    }
  }
  
}

export default new CombosController()