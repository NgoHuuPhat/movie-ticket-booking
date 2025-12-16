import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { IUserRequest } from '@/types/user'

class DiscountsController {

  // [GET] /discounts
  async getDiscountsForUser(req: IUserRequest, res: Response) {
    try {
        const maLoaiNguoiDung = req.user?.maLoaiNguoiDung
        const result = await prisma.kHUYENMAI.findMany({
          where: { 
            hoatDong: true,
            OR: [
              { dieuKienKhuyenMai: { maLoaiNguoiDung: maLoaiNguoiDung } },
              { dieuKienKhuyenMai: { maLoaiNguoiDung: null } }
            ]
           },
        })
        return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new DiscountsController()