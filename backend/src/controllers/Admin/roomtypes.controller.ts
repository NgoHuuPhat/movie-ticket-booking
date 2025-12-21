
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class LoaiPhongChieusController {

  // [GET] /admin/roomtypes
  async getAllRoomTypes(req: Request, res: Response) {
    try {
      const { search } = req.query
      const roomTypes = await prisma.lOAIPHONGCHIEU.findMany({
        orderBy: { maLoaiPhong: 'asc' },
        where: search ? { tenLoaiPhong: {
          contains: String(search),
        }} : undefined
      })
      res.status(200).json(roomTypes)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/roomtypes
  async createRoomType(req: Request, res: Response) {
    try {
        const { tenLoaiPhong } = req.body
        const newId = await generateIncrementalId(prisma.lOAIPHONGCHIEU, 'maLoaiPhong', 'LP')
        const newRoomType = await prisma.lOAIPHONGCHIEU.create({
          data: {
              maLoaiPhong: newId,
              tenLoaiPhong
          }
        })
        res.status(201).json({ message: 'Loại phòng đã được tạo thành công', roomType: newRoomType })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/roomtypes/:id
  async updateRoomType(req: Request, res: Response) {
    try {
        const { id } = req.params
        const { tenLoaiPhong } = req.body
        const updatedRoomType = await prisma.lOAIPHONGCHIEU.update({
          where: { maLoaiPhong: id },
          data: { tenLoaiPhong }
        })
        res.status(200).json({message: 'Loại phòng đã được cập nhật thành công', roomType: updatedRoomType})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/roomtypes/:id
  async deleteRoomType(req: Request, res: Response) {
    try {
        const { id } = req.params
        await prisma.lOAIPHONGCHIEU.delete({
            where: { maLoaiPhong: id }
        })
        res.status(204).json({ message: 'Loại phòng đã được xóa thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new LoaiPhongChieusController()