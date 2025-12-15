import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class PhimsController {

  // [GET] /movie
  async getAllPhim(req: Request, res: Response) {
    try {
        const result = (await prisma.pHIM.findMany({
          include: {
            phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } },
            phimTheLoais: {
              include: { theLoai: { select: { tenTheLoai: true } } }
            }
          },
          where: { hienThi: true },
          orderBy: { ngayKhoiChieu: 'desc' }
        })).map(({ phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phim }) => ({
          ...phim,
          theLoais: phimTheLoais.map(ptl => ptl.theLoai.tenTheLoai),
          tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
        }))
      
        const phimDangChieu = result.filter(phim => phim.ngayKhoiChieu <= new Date() && phim.ngayKetThuc >= new Date())
        const phimSapChieu = result.filter(phim => phim.ngayKhoiChieu > new Date())

        return res.status(200).json({ phimDangChieu, phimSapChieu })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /movie/showing
  async getPhimDangChieu(req: Request, res: Response) {
    try {
        const result = (await prisma.pHIM.findMany({
          include: {
            phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } }, 
            phimTheLoais: {
              include: { theLoai: { select: { tenTheLoai: true } } }
            }
          },
          where: { 
            hienThi: true,
            ngayKhoiChieu: { lte: new Date() },
            ngayKetThuc: { gte: new Date() }
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

  // [GET] /movie/upcoming
async getPhimSapChieu(req: Request, res: Response) {
    try {
        const result = (await prisma.pHIM.findMany({
          include: {
            phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } }, 
            phimTheLoais: {
              include: { theLoai: { select: { tenTheLoai: true } } }
            }
          },
          where: { 
            hienThi: true,
            ngayKhoiChieu: { gt: new Date() },
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

  // [GET] /movie/:slug
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

  // [GET] /movie/:id/showtimes
  async getSuatChieuByPhimId(req: Request, res: Response) {
    try {
      const { id } = req.params
      const suatChieus = (await prisma.sUATCHIEU.findMany({
        where: { maPhim: id, ngayChieu: { gte: new Date()}},
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