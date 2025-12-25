import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class DanhMucSanPhamsController {

  // [GET] /product-categories
  async getAllProductCategories(req: Request, res: Response) {
    try {
      const { search } = req.query
      const result = await prisma.dANHMUCSANPHAM.findMany({
        where: search ? {
          tenDanhMucSanPham: {
            contains: search as string,
            mode: 'insensitive'
          }
        } : undefined,
        orderBy: { maDanhMucSanPham: 'asc' },
        include: {
          _count: { select: { sanPhams: true } }
        }
      })
      return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /product-categories
  async createProductCategory(req: Request, res: Response) {
    try {
      const { tenDanhMucSanPham } = req.body
      const maDanhMucSanPham = await generateIncrementalId(prisma.dANHMUCSANPHAM, 'maDanhMucSanPham', 'DM')
      const newCategory = await prisma.dANHMUCSANPHAM.create({
        data: { maDanhMucSanPham, tenDanhMucSanPham }
      })
      return res.status(201).json({ message: 'Thêm danh mục sản phẩm thành công', newCategory })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /product-categories/:id
  async deleteProductCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.dANHMUCSANPHAM.delete({
        where: { maDanhMucSanPham: id }
      })
      return res.status(204).json({ message: 'Xóa danh mục sản phẩm thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /product-categories/:id
  async updateProductCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenDanhMucSanPham } = req.body
      const updatedCategory = await prisma.dANHMUCSANPHAM.update({
        where: { maDanhMucSanPham: id },
        data: { tenDanhMucSanPham }
      })
      return res.status(200).json({ message: 'Cập nhật danh mục sản phẩm thành công', updatedCategory })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new DanhMucSanPhamsController()