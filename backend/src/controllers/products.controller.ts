import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class SanPhamsController {

  // [GET] /product/categories-with-products
  async getDanhMucVoiSanPhams(req: Request, res: Response) {
    try {
        const result = await prisma.dANHMUCSANPHAM.findMany({
          where: { sanPhams: { some: { hienThi: true } } },
          include: { sanPhams: { where: { hienThi: true }, select: { maSanPham: true, tenSanPham: true, anhSanPham: true, giaTien: true } } }
        })
        return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new SanPhamsController()