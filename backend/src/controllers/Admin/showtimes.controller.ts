import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class SuatChieusController {

  // [GET] /showtimes
  async getAllShowtimes(req: Request, res: Response) {
    try {
      const { trangThai, date, search, page = 1, sortField = 'maSuatChieu', sortOrder = 'desc' } = req.query
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string

      if(trangThai === 'sapChieu') {
        filter.gioBatDau = { gt: new Date() }
      } 
      if(trangThai === 'dangChieu') {
        filter.gioBatDau = { lte: new Date() }
        filter.gioKetThuc = { gt: new Date() }
      }
      if(trangThai === 'daKetThuc') {
        filter.gioKetThuc = { lte: new Date() }
      }

      if(date) {
        const selectedDate = new Date(date as string)
        const nextDate = new Date(selectedDate)
        nextDate.setDate(selectedDate.getDate() + 1)
        filter.gioBatDau = { gte: selectedDate, lt: nextDate }
      }
      
      if(search) {
        filter.phim = { tenPhim: { contains: search as string, mode: 'insensitive' } }
      }

      const [showtimes, total] = await Promise.all([
        prisma.sUATCHIEU.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: {
            phim: true,
            phongChieu: true
          }
        }),
        prisma.sUATCHIEU.count({ where: filter })
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)
      
      return res.status(200).json({ showtimes, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /showtimes
  async createShowtime(req: Request, res: Response) {
    try {
      const { maPhim, maPhong, gioBatDau, gioKetThuc } = req.body
      const phim = await prisma.pHIM.findUnique({ where: { maPhim } })
      if(!phim) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }
      if(new Date(gioBatDau) < phim.ngayKhoiChieu || new Date(gioKetThuc) > phim.ngayKetThuc) {
        return res.status(400).json({ message: 'Suất chiếu phải nằm trong khoảng thời gian chiếu của phim' })
      }

      if(new Date(gioBatDau) >= new Date(gioKetThuc)) {
        return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu' })
      }
      const maSuatChieu = await generateIncrementalId(prisma.sUATCHIEU, 'maSuatChieu', 'SC')
      
      const newShowtime = await prisma.$transaction(async (tx) => {
        const newShowtime = await tx.sUATCHIEU.create({
          data: {
            maSuatChieu,
            maPhim,
            maPhong,
            gioBatDau: new Date(gioBatDau),
            gioKetThuc: new Date(gioKetThuc),
            hoatDong: true
          },
          include: { phim: true, phongChieu: true }
        })

        await tx.gHE_SUATCHIEU.createMany({
          data: (await tx.gHE.findMany({ where: { maPhong } })).map(ghe => ({
            maGhe: ghe.maGhe,
            maSuatChieu,
          }))
        })

        return newShowtime
      })

      return res.status(201).json({message: 'Tạo suất chiếu thành công', newShowtime})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /showtimes/:id
  async updateShowtime(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { gioBatDau, gioKetThuc } = req.body
      const showtime = await prisma.sUATCHIEU.findUnique({
        where: { maSuatChieu: id },
        include: { phim: true }
      })
      if(!showtime) {
        return res.status(404).json({ message: 'Suất chiếu không tồn tại' })
      }
      const phim = showtime.phim
      if(new Date(gioBatDau) < phim.ngayKhoiChieu || new Date(gioKetThuc) > phim.ngayKetThuc) {
        return res.status(400).json({ message: 'Suất chiếu phải nằm trong khoảng thời gian chiếu của phim' })
      }

      if(new Date(gioBatDau) >= new Date(gioKetThuc)) {
        return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu' })
      }
      const updatedShowtime = await prisma.sUATCHIEU.update({
        where: { maSuatChieu: id },
        data: {
          gioBatDau: new Date(gioBatDau),
          gioKetThuc: new Date(gioKetThuc)
        },
        include: { phim: true, phongChieu: true }
      })
      return res.status(200).json({message: 'Cập nhật suất chiếu thành công', updatedShowtime})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /showtimes/:id
  async deleteShowtime(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.sUATCHIEU.delete({
        where: { maSuatChieu: id }
      })
      return res.status(200).json({ message: 'Xóa suất chiếu thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
  // [GET] /showtimes/stats
  async getShowtimeStats(req: Request, res: Response) {
    const now = new Date()

    const [sapChieu, dangChieu, daKetThuc, total] = await Promise.all([
      prisma.sUATCHIEU.count({
        where: { gioBatDau: { gt: now } }
      }),
      prisma.sUATCHIEU.count({
        where: {
          gioBatDau: { lte: now },
          gioKetThuc: { gt: now }
        }
      }),
      prisma.sUATCHIEU.count({
        where: { gioKetThuc: { lte: now } }
      }),
      prisma.sUATCHIEU.count()
    ])

    res.json({ total, sapChieu, dangChieu, daKetThuc })
  }

  // [POST] /showtimes/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { showtimeIds, action } = req.body
      switch(action) {
        case 'hoatDong':
          await prisma.sUATCHIEU.updateMany({
            where: { maSuatChieu: { in: showtimeIds } },
            data: { hoatDong: true }
          })
          res.status(200).json({ message: 'Kích hoạt suất chiếu thành công' })
          break
        case 'ngungHoatDong':
          await prisma.sUATCHIEU.updateMany({
            where: { maSuatChieu: { in: showtimeIds } },
            data: { hoatDong: false }
          })
          res.status(200).json({ message: 'Ngừng kích hoạt suất chiếu thành công' })
          break
        case 'xoa':
          await prisma.sUATCHIEU.deleteMany({
            where: { maSuatChieu: { in: showtimeIds } }
          })
          res.status(200).json({ message: 'Xóa suất chiếu thành công' })
          break
        default:
          res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /showtimes/:id/activate
  async toggleShowtimeActivation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const showtime = await prisma.sUATCHIEU.findUnique({
        where: { maSuatChieu: id }
      })
      if(!showtime) {
        return res.status(404).json({ message: 'Suất chiếu không tồn tại' })
      }
      const updatedShowtime = await prisma.sUATCHIEU.update({
        where: { maSuatChieu: id },
        data: { hoatDong: !showtime.hoatDong },
      })
      res.status(200).json({ message: 'Cập nhật trạng thái suất chiếu thành công', updatedShowtime })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new SuatChieusController()