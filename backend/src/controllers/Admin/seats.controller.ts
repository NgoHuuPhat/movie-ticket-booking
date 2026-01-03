
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class GhesController {

  // [GET] /admin/seats/types
  async getAllCategories(req: Request, res: Response) {
    try {
      const { search } = req.query
      const filter: any = {}
      if(search !== undefined) {
        filter.OR = [
          { tenLoaiGhe: { contains: search as string, mode: "insensitive" } },
          { moTa: { contains: search as string, mode: "insensitive" } },
        ]
      }

      const categories = await prisma.lOAIGHE.findMany({
        where: filter,
      })
      
      res.status(200).json(categories)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi lấy danh sách loại ghế', error })
    }
  }

  // [POST] /admin/seats/types
  async createCategory(req: Request, res: Response) {
    try {
      const { tenLoaiGhe, moTa } = req.body
      const newId = await generateIncrementalId(prisma.lOAIGHE, 'maLoaiGhe', 'LG')
      const newCategory = await prisma.lOAIGHE.create({
        data: {
          maLoaiGhe: newId,
          tenLoaiGhe,
          moTa,
        },
      })
      res.status(201).json({message: 'Tạo loại ghế mới thành công', category: newCategory})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi tạo loại ghế mới', error })
    }
  }

  // [PATCH] /admin/seats/types/:id
  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenLoaiGhe, moTa } = req.body
      const updatedCategory = await prisma.lOAIGHE.update({
        where: { maLoaiGhe: id },
        data: {
          tenLoaiGhe,
          moTa,
        },
      })
      res.status(200).json({message: 'Cập nhật loại ghế thành công', category: updatedCategory})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật loại ghế', error })
    }
  }

  // [DELETE] /admin/seats/types/:id
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.lOAIGHE.delete({
        where: { maLoaiGhe: id },
      })
      res.status(200).json({ message: 'Xóa loại ghế thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi xóa loại ghế', error })
    }
  }

  // [GET] /admin/seats/prices
  async getAllPrices(req: Request, res: Response) {
    try {
      const { search } = req.query
      const prices = await prisma.gIAGHEPHONG.findMany({
        where: search ? {
          OR: [
            { loaiGhe: { tenLoaiGhe: { contains: search as string, mode: "insensitive" } } },
            { loaiPhongChieu: { tenLoaiPhong: { contains: search as string, mode: "insensitive" } } },
          ] 
        } : undefined,
        orderBy: { maLoaiPhong: 'asc' },
        include: {
          loaiGhe: true,
          loaiPhongChieu: true,
        },
      })
      res.status(200).json(prices)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi lấy danh sách giá ghế', error })
    }
  }

  // [POST] /admin/seats/prices
  async createPrice(req: Request, res: Response) {
    try {
      const { maLoaiPhong, maLoaiGhe, giaTien } = req.body
      const newPrice = await prisma.gIAGHEPHONG.create({
        data: {
          maLoaiPhong,
          maLoaiGhe,
          giaTien,
        },
        include: {
          loaiGhe: true,
          loaiPhongChieu: true,
        },
      })
      res.status(201).json({message: 'Tạo giá ghế mới thành công', price: newPrice})
    } catch (error: any) {
      console.error(error)
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Giá ghế cho loại phòng và loại ghế này đã tồn tại' })
      }
      res.status(500).json({ message: 'Lỗi khi tạo giá ghế mới', error })
    }
  }

  // [PATCH] /admin/seats/prices/:maLoaiPhong/:maLoaiGhe
  async updatePrice(req: Request, res: Response) {
    try {
      const { maLoaiPhong, maLoaiGhe } = req.params
      const { giaTien } = req.body
      const updatedPrice = await prisma.gIAGHEPHONG.update({
        where: {
          maLoaiPhong_maLoaiGhe: {
            maLoaiPhong: maLoaiPhong,
            maLoaiGhe: maLoaiGhe,
          },
        },
        data: {
          giaTien,
        },
      })
      res.status(200).json({message: 'Cập nhật giá ghế thành công', price: updatedPrice})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật giá ghế', error })
    }
  }
}

export default new GhesController()