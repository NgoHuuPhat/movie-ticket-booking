
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class LichLamViecsController {

  // [GET] /admin/workschedules
  async getAllWorkSchedules(req: Request, res: Response) {
    try {
      const { ngayLam, maCaLam, viTriLam, search, page = 1} = req.query
      const limit = 10
      const skip = (Number(page) - 1) * limit
      const filter: any = {}

      if(ngayLam) {
        filter.ngayLam = new Date(ngayLam as string)
      }

      if(maCaLam) {
        filter.maCaLam = maCaLam
      }

      if(viTriLam) {
        filter.viTriLam = viTriLam
      }

      if(search) {
        filter.nguoiDung = {
          hoTen: { contains: search as string, mode: 'insensitive' }
        }
      }

      const [workSchedules, total] = await Promise.all([
        prisma.lICHLAMVIEC.findMany({
          where: filter,
          skip,
          take: limit,
          include: {
            nguoiDung: true,
            caLam: true,
          }
        }),
        prisma.lICHLAMVIEC.count({ where: filter })
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      res.status(200).json({ workSchedules, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit) ) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/workschedules
  async createWorkSchedule(req: Request, res: Response) {
    try {
      const { maNhanVien, maCaLam, ngayLam, viTriLam } = req.body
      const newWorkSchedule = await prisma.lICHLAMVIEC.create({
        data: {
          maNhanVien,
          maCaLam,
          ngayLam: new Date(ngayLam),
          viTriLam,
        },
        include: {
          nguoiDung: true,
          caLam: true,
        }
      })
      res.status(201).json({message: 'Tạo lịch làm việc mới thành công', newWorkSchedule})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/workschedules/:maNhanVien/:maCaLam/:ngayLam
  async updateWorkSchedule(req: Request, res: Response) {
    try {
      const { maNhanVien, maCaLam, ngayLam } = req.params
      const { viTriLam } = req.body

      if (!viTriLam) {
        return res.status(400).json({ message: "Vị trí làm việc là bắt buộc" })
      }

      const updatedWorkSchedule = await prisma.lICHLAMVIEC.update({
        where: {
          maNhanVien_maCaLam_ngayLam: {
            maNhanVien,
            maCaLam,
            ngayLam: new Date(ngayLam),
          },
        },
        data: {
          viTriLam,
        },
        include: {
          nguoiDung: true,
          caLam: true,
        },
      });

      return res.status(200).json({
        message: "Cập nhật thành công",
        updatedWorkSchedule,
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" })
    }
  }

  // [DELETE] /admin/workschedules//:maNhanVien/:maCaLam/:ngayLam
  async deleteWorkSchedule(req: Request, res: Response) {
    try {
      const { maNhanVien, maCaLam, ngayLam } = req.params
      await prisma.lICHLAMVIEC.delete({
        where: { maNhanVien_maCaLam_ngayLam: {
          maNhanVien,
          maCaLam,
          ngayLam: new Date(ngayLam),
        }},
      })

      res.status(200).json({message: 'Xóa lịch làm việc thành công'})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new LichLamViecsController()