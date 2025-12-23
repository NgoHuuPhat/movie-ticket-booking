import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import slugify from 'slugify'
import { deleteFromS3 } from '@/services/s3.service'
import { parseS3Url } from '@/utils/s3.utils'
import { getMovieStatus } from '@/utils/getMovieStatus.utils'

class PhimsController {

  // [POST] /admin/movies
  async createMovie(req: Request, res: Response) {
    try {
      const { tenPhim, daoDien, dienVien, thoiLuong, moTa, ngayKhoiChieu, ngayKetThuc, maPhanLoaiDoTuoi, trailerPhim, quocGia, phienBan, ngonNgu, maTheLoais } = req.body
      const anhBia = req.body.imageUrl 
      if(!anhBia) {
        return res.status(400).json({ message: 'Ảnh bìa phim là bắt buộc' })
      }

      const maPhim = await generateIncrementalId(prisma.pHIM, 'maPhim', 'P')
      const slug = slugify(tenPhim, { lower: true, strict: true, locale: 'vi' })

      if(new Date(ngayKhoiChieu) > new Date(ngayKetThuc)) {
        return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày khởi chiếu' })
      }
      const endDate = new Date(ngayKetThuc)
      endDate.setHours(23, 59, 59, 999)

      const newMovie = await prisma.pHIM.create({
        data: {
          maPhim,
          tenPhim,
          daoDien,
          dienVien,
          thoiLuong: Number(thoiLuong),
          moTa,
          anhBia,
          ngayKhoiChieu: new Date(ngayKhoiChieu),
          ngayKetThuc: endDate,
          maPhanLoaiDoTuoi,
          trailerPhim,
          quocGia,
          phienBan,
          ngonNgu,
          slug,
          phimTheLoais: {
            create: maTheLoais.map((maTheLoai: string) => ({ maTheLoai }))
          }
        },
        include: { phimTheLoais: { include: { theLoai: true } } }
      })
      const mappedTheLoais = newMovie.phimTheLoais.map(ptl => ({
        maTheLoai: ptl.maTheLoai,
        tenTheLoai: ptl.theLoai.tenTheLoai
      }))
      const status = getMovieStatus(new Date(ngayKhoiChieu), endDate)

      res.status(201).json({ message: 'Thêm phim mới thành công', movie: { ...newMovie, phimTheLoais: mappedTheLoais, trangThai: status } })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/movies
  async getAllMovies(req: Request, res: Response) {
    try {
        const { hienThi, trangThai, search, page = 1, sortField = 'maPhim', sortOrder = 'desc' } = req.query
        const limit = 10
        const filter: any = {}
        const skip = (Number(page) - 1) * limit
        const sortFields = sortField as string

        if(hienThi !== undefined) {
          filter.hienThi = hienThi === 'true'
        }
        if(trangThai === 'dangChieu') {
          filter.ngayKhoiChieu = { lte: new Date() }
          filter.ngayKetThuc = { gte: new Date() }
        }
        if(trangThai === 'sapChieu') {
          filter.ngayKhoiChieu = { gt: new Date() }
        }
        if(trangThai === 'daKetThuc') {
          filter.ngayKetThuc = { lte: new Date() }
        }

        if(search) {
          filter.tenPhim = { contains: search as string, mode: 'insensitive'}
        }

        const [movies, total] = await Promise.all([
          prisma.pHIM.findMany({
            where: filter,
            orderBy: { [sortFields]: sortOrder },
            skip,
            take: limit,
            include: {
              phanLoaiDoTuoi: true, 
              phimTheLoais: {
                include: { theLoai: { select: { tenTheLoai: true } } }
              }
            },
          }),
          prisma.pHIM.count({ where: filter }),
        ])

        const resultMovies = movies.map(({ phimTheLoais, ...phim }) => {
          const status = getMovieStatus(phim.ngayKhoiChieu, phim.ngayKetThuc)
          return {
            ...phim,
            trangThai: status,
            phimTheLoais: phimTheLoais.map(ptl => ({
              maTheLoai: ptl.maTheLoai,
              tenTheLoai: ptl.theLoai.tenTheLoai
            })),
          }
        })

        const startIndex = skip + 1
        const endIndex = Math.min(Number(page) * Number(limit), total)

        return res.status(200).json({ movies: resultMovies, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/movies/stats
  async getMovieStats(req: Request, res: Response) {
    try {
      const [ totalMovies, totalShowing, totalUpcoming, totalEnded ] = await Promise.all([
        prisma.pHIM.count(),
        prisma.pHIM.count({
          where: {
            ngayKhoiChieu: { lte: new Date() },
            ngayKetThuc: { gte: new Date() }
          }
        }),
        prisma.pHIM.count({
          where: {
            ngayKhoiChieu: { gt: new Date() }
          }
        }),
        prisma.pHIM.count({
          where: {
            ngayKetThuc: { lte: new Date() }
          }
        }),
      ])

      return res.status(200).json({ totalMovies, totalShowing, totalUpcoming, totalEnded })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/movies/:id
  async deleteMovie(req: Request, res: Response) {
    try {
      const { id } = req.params
      const movie = await prisma.pHIM.findUnique({
        where: { maPhim: id },
        select: { anhBia: true }
      })
      if (!movie) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }

      await prisma.pHIM.delete({
        where: { maPhim: id }
      })

      const { folderName, fileName } = parseS3Url(movie.anhBia)
      await deleteFromS3(folderName, fileName)

      res.status(200).json({ message: 'Xóa phim thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/movies/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { movieIds, action } = req.body

      switch (action) {
        case 'xoa':
          const moviesToDelete = await prisma.pHIM.findMany({
            where: { maPhim: { in: movieIds } },
            select: { anhBia: true }
          })
          for (const movie of moviesToDelete) {
            if (movie.anhBia) {
              const { folderName, fileName } = parseS3Url(movie.anhBia)
              await deleteFromS3(folderName, fileName)
            }
          }

          await prisma.pHIM.deleteMany({
            where: { maPhim: { in: movieIds } }
          })
          return res.status(200).json({ message: 'Xóa phim thành công' })
        case 'hienThi':
          await prisma.pHIM.updateMany({
            where: { maPhim: { in: movieIds } },
            data: { hienThi: true }
          })
          return res.status(200).json({ message: 'Hiển thị phim thành công' })
        case 'an':
          await prisma.pHIM.updateMany({
            where: { maPhim: { in: movieIds } },
            data: { hienThi: false }
          })
          return res.status(200).json({ message: 'Ẩn phim thành công' })
        default:
          return res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/movies/:id
  async getMovieById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const movie = await prisma.pHIM.findUnique({
        where: { maPhim: id },
        include: {
          phanLoaiDoTuoi: { select: { tenPhanLoaiDoTuoi: true } },
          phimTheLoais: {
            include: { theLoai: { select: { tenTheLoai: true } } }
          }
        }
      })
      if (!movie) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }

      const { phimTheLoais, maPhanLoaiDoTuoi, phanLoaiDoTuoi, ...phimData } = movie
      const resultMovie = {
        ...phimData,
        theLoais: phimTheLoais.map(ptl => ({ maTheLoai: ptl.maTheLoai, tenTheLoai: ptl.theLoai.tenTheLoai })),
        tenPhanLoaiDoTuoi: phanLoaiDoTuoi.tenPhanLoaiDoTuoi,
      }
      res.status(200).json({ movie: resultMovie })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/movies/:id
  async updateMovie(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingMovie = await prisma.pHIM.findUnique({
        where: { maPhim: id },
        select: { anhBia: true }
      })
      if (!existingMovie) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }

      const { tenPhim, daoDien, dienVien, thoiLuong, moTa, ngayKhoiChieu, ngayKetThuc, maPhanLoaiDoTuoi, trailerPhim, quocGia, phienBan, ngonNgu, maTheLoais } = req.body
      const anhBia = req.body.imageUrl 
      
      if(anhBia && existingMovie.anhBia !== anhBia) {
        const { folderName, fileName } = parseS3Url(existingMovie.anhBia)
        await deleteFromS3(folderName, fileName)
      } else {
        req.body.anhBia = existingMovie.anhBia
      }
      
      if(new Date(ngayKhoiChieu) > new Date(ngayKetThuc)) {
        return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày khởi chiếu' })
      } 

      const endDate = new Date(ngayKetThuc)
      endDate.setHours(23, 59, 59, 999)
      const slug = slugify(tenPhim, { lower: true, strict: true, locale: 'vi' })
      
      const updatedMovie = await prisma.pHIM.update({
        where: { maPhim: id },
        data: {
          tenPhim,
          daoDien,
          dienVien,
          thoiLuong: Number(thoiLuong),
          moTa,
          anhBia,
          ngayKhoiChieu: new Date(ngayKhoiChieu),
          ngayKetThuc: endDate,
          maPhanLoaiDoTuoi,
          trailerPhim,
          quocGia,
          phienBan,
          ngonNgu,
          slug,
          phimTheLoais: {
            deleteMany: {},
            create: maTheLoais.map((maTheLoai: string) => ({ maTheLoai }))
          }
        },
        include: { phimTheLoais: { include: { theLoai: true } } }
      })
      const mappedTheLoais = updatedMovie.phimTheLoais.map(ptl => ({
        maTheLoai: ptl.maTheLoai,
        tenTheLoai: ptl.theLoai.tenTheLoai
      }))

      const status = getMovieStatus(new Date(ngayKhoiChieu), endDate)
      res.status(200).json({ message: 'Cập nhật phim thành công', movie: { ...updatedMovie, phimTheLoais: mappedTheLoais, trangThai: status } })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/movies/:id/show
  async toggleShowMovie(req: Request, res: Response) {
    try {
      const { id } = req.params
      const movie = await prisma.pHIM.findUnique({ where: { maPhim: id }})
      if (!movie) {
        return res.status(404).json({ message: 'Phim không tồn tại' })
      }
      const updatedMovie = await prisma.pHIM.update({
        where: { maPhim: id },
        data: { hienThi: !movie.hienThi }
      })
      res.status(200).json({ message: 'Cập nhật trạng thái hiển thị phim thành công', movie: updatedMovie })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/movies/select
  async getMoviesForSelect(req: Request, res: Response) {
    try {
      const movies = await prisma.pHIM.findMany({
        where: { 
          hienThi: true,
          ngayKhoiChieu: { lte: new Date()},
          ngayKetThuc: { gte: new Date() }
         },
        orderBy: { ngayKhoiChieu: 'desc' },
        select: { maPhim: true, tenPhim: true, ngayKetThuc: true, ngayKhoiChieu: true }
      })
      res.status(200).json(movies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new PhimsController()