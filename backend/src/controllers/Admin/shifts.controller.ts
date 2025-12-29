
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { timeStringToDateTime } from '@/utils/date.utils'

class CaLamsController {

  // [GET] /admin/shifts
  async getAllShifts(req: Request, res: Response) {
    try {
      const { search } = req.query
      const shifts = await prisma.cALAM.findMany({
        where: search ? {
          tenCaLam: {
            contains: String(search),
            mode: 'insensitive',
          },
        } : undefined,
        orderBy: { maCaLam: 'asc' },
      })
      
      res.status(200).json(shifts)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/shifts
  async createShift(req: Request, res: Response) {
    try {
      const { tenCaLam, gioBatDau, gioKetThuc } = req.body
      const maCaLam = await generateIncrementalId(prisma.cALAM, 'maCaLam', 'CA')
      const newShift = await prisma.cALAM.create({
        data: {
          maCaLam,
          tenCaLam,
          gioBatDau: timeStringToDateTime(gioBatDau),
          gioKetThuc: timeStringToDateTime(gioKetThuc),
        },
      })
      res.status(201).json({message: 'Tạo ca làm mới thành công', newShift})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/shifts
  async updateShift(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenCaLam, gioBatDau, gioKetThuc } = req.body
      const updatedShift = await prisma.cALAM.update({
        where: { maCaLam: id },
        data: {
          tenCaLam,
          gioBatDau: timeStringToDateTime(gioBatDau),
          gioKetThuc: timeStringToDateTime(gioKetThuc),
        },
      })
      res.status(200).json({message: 'Cập nhật ca làm thành công', updatedShift})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/shifts/:id
  async deleteShift(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.cALAM.delete({
        where: { maCaLam: id },
      })
      res.status(200).json({ message: 'Xóa ca làm thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new CaLamsController()