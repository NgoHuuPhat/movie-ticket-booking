
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

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

  // [PATCH] /admin/cinema
  async updateCinemaInfo(req: Request, res: Response) {
    try {
      const { tenRap, diaChi, soDienThoai, email } = req.body
      const maRap = process.env.DEFAULT_RAP
      if(!maRap) {
        return res.status(500).json({ message: 'Default cinema ID is not set' })
      }
      const updatedCinema = await prisma.rAP.update({
        where: { maRap },
        data: { tenRap, diaChi, soDienThoai, email }
      })
      res.status(200).json({message: 'Cập nhật thông tin rạp thành công', cinema: updatedCinema})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/cinema/rooms
  async getAllRooms(req: Request, res: Response) {
    try {
      const { hoatDong, search, page = 1, sortField = 'maPhong', sortOrder = 'desc' } = req.query
        const limit = 10
        const filter: any = {}
        const skip = (Number(page) - 1) * limit
        const sortFields = sortField as string

        if(hoatDong !== undefined) {
          filter.hoatDong = hoatDong === 'true'
        }
        if(search) {
          filter.tenPhong = { contains: search as string, mode: 'insensitive'}
        }
        
      const [rooms, total] = await Promise.all([
        prisma.pHONGCHIEU.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: { loaiPhongChieu: { select: { tenLoaiPhong: true } } }
        }),
        prisma.pHONGCHIEU.count({ where: filter })
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      res.status(200).json({ rooms, total, limit, page: Number(page), startIndex, endIndex, totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/cinema/rooms/select
  async getRoomsForSelect(req: Request, res: Response) {
    try {
      const rooms = await prisma.pHONGCHIEU.findMany({where: { hoatDong: true }})
      res.status(200).json(rooms)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/cinema/rooms
  async createRoom(req: Request, res: Response) {
    try {
      const { tenPhong, maLoaiPhong, soHang, soCot, seatConfig } = req.body
      const maRap = process.env.DEFAULT_RAP
      
      if(!maRap) {
        return res.status(500).json({ message: 'Cấu hình rạp mặc định chưa được thiết lập' })
      }

      if (!tenPhong || !maLoaiPhong || !soHang || !soCot || !seatConfig) {
        return res.status(400).json({ message: 'Thiếu trường dữ liệu bắt buộc' })
      }

      if (soHang < 1 || soHang > 26) {
        return res.status(400).json({ message: 'Số hàng phải từ 1 đến 26' })
      }

      if (soCot < 1 || soCot > 30) {
        return res.status(400).json({ message: 'Số cột phải từ 1 đến 30' })
      }

      const result = await prisma.$transaction(async (tx) => {
        const newRoomId = await generateIncrementalId(tx.pHONGCHIEU, 'maPhong', 'P')
        const newRoom = await tx.pHONGCHIEU.create({
          data: {
            maPhong: newRoomId,
            tenPhong,
            maLoaiPhong,
            maRap: maRap,
          },
          include: { loaiPhongChieu: { select: { tenLoaiPhong: true } } }
        })

        const seatsToCreate = seatConfig.map((seat: any) => ({
          maGhe: `${newRoomId}-${seat.hangGhe}${seat.soGhe}`,
          maPhong: newRoomId,
          hangGhe: seat.hangGhe,
          soGhe: seat.soGhe,
          maLoaiGhe: seat.maLoaiGhe,
          hoatDong: seat.hoatDong,
        }))

        await tx.gHE.createMany({
          data: seatsToCreate
        })

        return newRoom
      })

      res.status(201).json({
        message: 'Tạo phòng chiếu và cấu hình ghế thành công', 
        room: result
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/cinema/rooms/:id
  async updateRoom(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenPhong, maLoaiPhong, hoatDong } = req.body
      const updatedRoom = await prisma.pHONGCHIEU.update({
        where: { maPhong: id },
        data: { tenPhong, maLoaiPhong, hoatDong },
        include: { loaiPhongChieu: { select: { tenLoaiPhong: true } } }
      })
      res.status(200).json({message: 'Cập nhật phòng chiếu thành công', room: updatedRoom})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/cinema/rooms/:id
  async deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.pHONGCHIEU.delete({
        where: { maPhong: id }
      })
      res.status(200).json({ message: 'Room deleted successfully' })
    } catch (error: any) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/cinema/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { roomIds, action } = req.body
      switch(action) {
        case 'xoa':
          await prisma.pHONGCHIEU.deleteMany({
            where: { maPhong: { in: roomIds } }
          })
          res.status(200).json({ message: 'Rooms deleted successfully' })
          break
        case 'hoatDong':
          await prisma.pHONGCHIEU.updateMany({
            where: { maPhong: { in: roomIds } },
            data: { hoatDong: true }
          })
          res.status(200).json({ message: 'Rooms activated successfully' })
          break
        case 'ngungHoatDong':
          await prisma.pHONGCHIEU.updateMany({
            where: { maPhong: { in: roomIds } },
            data: { hoatDong: false }
          })
          res.status(200).json({ message: 'Rooms deactivated successfully' })
          break
        default:
          res.status(400).json({ message: 'Invalid action' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/cinema/:id/activate
  async toggleCinemaActivation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const cinema = await prisma.pHONGCHIEU.findUnique({ where: { maPhong: id } })
      if(!cinema) {
        return res.status(404).json({ message: 'Phòng chiếu không tồn tại' })
      }
      const updatedCinema = await prisma.pHONGCHIEU.update({
        where: { maPhong: id },
        data: { hoatDong: !cinema.hoatDong },
        include: { loaiPhongChieu: { select: { tenLoaiPhong: true } } }
      })
      res.status(200).json({message: "Cập nhật trạng thái phòng chiếu thành công", room: updatedCinema})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/cinema/rooms/:id/seats
  async getRoomSeats(req: Request, res: Response) {
    try {
      const { id } = req.params
      const room = await prisma.pHONGCHIEU.findUnique({
        where: { maPhong: id },
        include: {
          ghes: {
            orderBy: [
              { hangGhe: 'asc' },
              { soGhe: 'asc' }
            ],
            include: {
              loaiGhe: true
            }
          }
        }
      })
      if (!room) {
        return res.status(404).json({ message: 'Phòng không tồn tại' })
      }
      
      res.json({room})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/cinema/rooms/:id/seats
  async updateRoomSeats(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { seatConfig } = req.body
      
      if (!seatConfig || !Array.isArray(seatConfig)) {
        return res.status(400).json({ message: 'Invalid seat configuration' })
      }
      
      await prisma.$transaction(async (tx) => {
        for (const seat of seatConfig) {
          const maGhe = `${id}-${seat.hangGhe}${seat.soGhe}`
          
          await tx.gHE.update({
            where: { maGhe },
            data: {
              maLoaiGhe: seat.maLoaiGhe,
              hoatDong: seat.hoatDong
            }
          })
        }
      })
      
      res.json({ message: 'Cập nhật sơ đồ ghế thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new RapController()