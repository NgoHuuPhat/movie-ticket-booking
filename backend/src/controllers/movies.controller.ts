import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { IUserRequest } from '@/types/user'

class PhimsController {

  // [GET] /movies/showing
  async getPhimDangChieu(req: IUserRequest, res: Response) {
    try {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999)

      const result = (await prisma.pHIM.findMany({
        include: {
          phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } }, 
          phimTheLoais: {
            include: { theLoai: { select: { tenTheLoai: true } } }
          }
        },
        where: { 
          hienThi: true,
          ngayKhoiChieu: { lte: endOfToday },
          ngayKetThuc: { gte: startOfToday }
        },
        orderBy: { ngayKhoiChieu: 'desc' }
      })).map(({ phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phim }) => ({
        ...phim,
        theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai),
        tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
      })) 

      return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /movies/upcoming
async getPhimSapChieu(req: Request, res: Response) {
    try {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999)
      
        const result = (await prisma.pHIM.findMany({
          include: {
            phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } }, 
            phimTheLoais: {
              include: { theLoai: { select: { tenTheLoai: true } } }
            }
          },
          where: { 
            hienThi: true,
            ngayKhoiChieu: { gt: endOfToday },
          },
          orderBy: { ngayKhoiChieu: 'asc' }
        })).map(({ phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phim }) => ({
          ...phim,
          theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai),
          tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
        })) 
        return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /movies/:slug
  async getPhimBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const phim = await prisma.pHIM.findUnique({
        where: { slug: slug },
        include: {
          phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true, moTa: true } }, 
          phimTheLoais: {
            include: { theLoai: { select: { tenTheLoai: true } } }
          }
        }
      })
      if (!phim) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }
      const { phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phimData } = phim
      const result = {
        ...phimData,
        theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai),
        tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
        moTaPhanLoaiDoTuoi: phanLoaiDoTuoi.moTa,
      }
      return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /movies
  async searchPhim(req: Request, res: Response) {
    try {
      const { search } = req.query
      const resultMovies = (await prisma.pHIM.findMany({
        include: {
          phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } }, 
          phimTheLoais: {
            include: { theLoai: { select: { tenTheLoai: true } } }
          }
        },
        where: { 
          hienThi: true,
          tenPhim: search ? { contains: (search as string), mode: 'insensitive' } : undefined,
        },
        orderBy: { ngayKhoiChieu: 'desc' }
      })).map(({ phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phim }) => ({
        ...phim,
        theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai),
        tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
      })) 

      return res.status(200).json(resultMovies)
    } catch (error) {
      
    }
  }

  // [GET] /movies/:id/showtimes
  async getSuatChieuByPhimId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const suatChieus = (await prisma.sUATCHIEU.findMany({
        where: { maPhim: id, gioBatDau: { gte: today }, hoatDong: true },
        include: {
          phongChieu: {
            include: {
              loaiPhongChieu: { select: { tenLoaiPhong: true } },
            }
          },
        }
      })).map(({ maPhong, phongChieu, ...suatChieu }) => ({
        ...suatChieu,
        tenLoaiPhong: phongChieu.loaiPhongChieu.tenLoaiPhong,
        tenPhongChieu: phongChieu.tenPhong,
      }))
      return res.status(200).json(suatChieus)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new PhimsController()