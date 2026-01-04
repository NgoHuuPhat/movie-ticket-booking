import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class BannersController {

  // [GET] /admin/banners
  async getAllBanners(req: Request, res: Response) {
    try {
      const banners = await prisma.bANNERQUANGCAO.findMany({
        where: { hienThi: true }, 
        orderBy: { viTriHienThi: 'asc' } 
      })
      return res.status(200).json(banners)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}
export default new BannersController()