import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class PhimController {

  // [GET] /phim
  async getAllPhim(req: Request, res: Response) {
    try {
        const result = (await prisma.pHIM.findMany({
          include: {
            phimTheLoais: {
              include: { theLoai: { select: { tenTheLoai: true } } }
            }
          }
        })).map(({ phimTheLoais, ...phim }) => ({
          ...phim,
          theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai)
        }))
      
        const phimDangChieu = result.filter(phim => phim.ngayKhoiChieu <= new Date() && phim.ngayKetThuc >= new Date())
        const phimSapChieu = result.filter(phim => phim.ngayKhoiChieu > new Date())

        return res.status(200).json({ phimDangChieu, phimSapChieu })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new PhimController()