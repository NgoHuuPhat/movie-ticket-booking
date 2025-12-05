import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class SuatChieuController {

  // [GET] /showtime/:id/seats
  async getGheTheoSuatChieuId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const showtime = await prisma.sUATCHIEU.findUnique({
        where: { maSuatChieu: id },
        include: { phongChieu: true }
      })
      if (!showtime) {
        return res.status(404).json({ message: 'Suất chiếu không tồn tại' })
      }

      const seats = (await prisma.gHE_SUATCHIEU.findMany({
        where: { maSuatChieu: id },
        include: { ghe: {
          include: { loaiGhe: {
            include: { giaGhePhongs: {
              where: { maLoaiPhong: showtime.phongChieu.maLoaiPhong },
              select: { giaTien: true }
            } }
          } }
        } },
      })).map(item => ({
        maGhe: item.ghe.maGhe,
        hangGhe: item.ghe.hangGhe,
        soGhe: item.ghe.soGhe,
        tenLoaiGhe: item.ghe.loaiGhe.tenLoaiGhe,
        giaTien: item.ghe.loaiGhe.giaGhePhongs[0]?.giaTien || 0,
        trangThai: item.trangThaiGhe
      }))

      return res.status(200).json(seats)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new SuatChieuController()