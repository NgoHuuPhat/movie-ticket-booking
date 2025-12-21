
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class TheLoaiPhimsController {

  // [GET] /admin/categories
  async getAllCategories(req: Request, res: Response) {
    try {
      const { search } = req.query

      const categories = await prisma.tHELOAI.findMany({
        orderBy: { maTheLoai: 'asc' },
        where: search ? {
          tenTheLoai: {
            contains: String(search),
          }
        } : undefined
      })
      res.status(200).json(categories)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/categories
  async createCategory(req: Request, res: Response) {
    try {
        const { tenTheLoai } = req.body
        const newId = await generateIncrementalId(prisma.tHELOAI, 'maTheLoai', 'TL')
        const newCategory = await prisma.tHELOAI.create({
            data: {
                maTheLoai: newId,
                tenTheLoai
            }
        })
        res.status(201).json({ message: 'Thể loại đã được tạo thành công', category: newCategory })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/categories/:id
  async updateCategory(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { tenTheLoai } = req.body
        const updatedCategory = await prisma.tHELOAI.update({
            where: { maTheLoai: id },
            data: { tenTheLoai }
        })
        res.status(200).json({message: 'Thể loại đã được cập nhật thành công', category: updatedCategory})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/categories/:id
  async deleteCategory(req: Request, res: Response) {
    try {
        const { id } = req.params
        await prisma.tHELOAI.delete({
            where: { maTheLoai: id }
        })
        res.status(204).json({ message: 'Category deleted successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new TheLoaiPhimsController()