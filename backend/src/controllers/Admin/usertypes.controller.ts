
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class LoaiNguoiDungsController {

  // [GET] /admin/usertypes
  async getAllUserTypes(req: Request, res: Response) {
    try {
      const userTypes = await prisma.lOAINGUOIDUNG.findMany()
      res.status(200).json(userTypes)
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error })
    }
  }

}

export default new LoaiNguoiDungsController()