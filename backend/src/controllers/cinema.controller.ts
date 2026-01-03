
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class RapController {

  // [GET] /admin/cinema
  async getInfoCinema(req: Request, res: Response) {
    try {
      const cinemaInfo = await prisma.rAP.findFirst()
      res.status(200).json(cinemaInfo)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new RapController()