
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'

class PhanLoaiDoTuoisController {

  // [GET] /admin/age-ratings
  async getAllAgeRatings(req: Request, res: Response) {
    try {
      const { search } = req.query
      const ageRatings = await prisma.pHANLOAIDOTUOI.findMany({
        orderBy: { maPhanLoaiDoTuoi: 'asc' },
        where: search ? {
          tenPhanLoaiDoTuoi: {
            contains: String(search),
          }
        } : undefined
      })
      res.status(200).json(ageRatings)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/age-ratings
  async createAgeRating(req: Request, res: Response) {
    try {
      const { tenPhanLoaiDoTuoi, moTa } = req.body
      const newId = await generateIncrementalId(prisma.pHANLOAIDOTUOI, 'maPhanLoaiDoTuoi', 'PL')
      const newAgeRating = await prisma.pHANLOAIDOTUOI.create({
        data: {
          maPhanLoaiDoTuoi: newId,
          tenPhanLoaiDoTuoi,
          moTa
        }
      })
      res.status(201).json({ message: 'Phân loại độ tuổi đã được tạo thành công', ageRating: newAgeRating })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/age-ratings/:id
  async updateAgeRating(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { tenPhanLoaiDoTuoi, moTa } = req.body
      const updatedAgeRating = await prisma.pHANLOAIDOTUOI.update({
        where: { maPhanLoaiDoTuoi: id },
        data: { tenPhanLoaiDoTuoi, moTa }
      })
      res.status(200).json({message: 'Phân loại độ tuổi đã được cập nhật thành công', ageRating: updatedAgeRating})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/age-ratings/:id
  async deleteAgeRating(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.pHANLOAIDOTUOI.delete({
        where: { maPhanLoaiDoTuoi: id }
      })
      res.status(200).json({ message: 'Phân loại độ tuổi đã được xóa thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new PhanLoaiDoTuoisController()