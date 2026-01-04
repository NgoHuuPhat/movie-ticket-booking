import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { parseS3Url } from '@/utils/s3.utils'
import { deleteFromS3 } from '@/services/s3.service'
import { IUserRequest } from '@/types/user'
import slugify from 'slugify'

class TinTucsController {

  // [GET] /admin/news
  async getAllNews(req: Request, res: Response) {
    try {
      const { hienThi, search, page = 1, sortField = 'maTinTuc', sortOrder = 'asc' } = req.query
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string

      if(hienThi !== undefined) {
        filter.hienThi = hienThi === 'true'
      }

      if(search) {
        filter.tieuDe = {
          contains: search as string,
          mode: 'insensitive',
        }
      }

      const [news, total] = await Promise.all([
        prisma.tINTUC.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: {
            nguoiDang: true,
          },
        }),
        prisma.tINTUC.count({ where: filter }),
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      return res.status(200).json({ news, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/news
  async createNews(req: IUserRequest, res: Response) {
    try {
      const { tieuDe, noiDung } = req.body
      const maNguoiDang = req.user?.maNguoiDung
      const anhDaiDien = req.body.imageUrl
      
      if(!anhDaiDien) {
        return res.status(400).json({ message: 'Ảnh tin tức là bắt buộc' })
      }
      if(!maNguoiDang) {
        return res.status(401).json({ message: 'Người dùng không hợp lệ' })
      }

      const slug = slugify(tieuDe, { lower: true, strict: true, locale: 'vi' })
      const maTinTuc = await generateIncrementalId(prisma.tINTUC, 'maTinTuc', 'TT')
      const newNews = await prisma.tINTUC.create({
        data: {
          maTinTuc,
          tieuDe,
          noiDung,
          anhDaiDien,
          slug,
          maNguoiDang,
        },
        include: {
          nguoiDang: true,
        },
      })

      res.status(201).json({ message: 'Tạo tin tức thành công', newNews })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/news/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { action, newsId } = req.body

      switch (action) {
        case 'xoa':
          const newsToDelete = await prisma.tINTUC.findMany({
            where: { maTinTuc: { in: newsId } },
            select: { anhDaiDien: true }
          })
          for (const news of newsToDelete) {
            if (news.anhDaiDien) {
              const { folderName, fileName } = parseS3Url(news.anhDaiDien)
              await deleteFromS3(folderName, fileName)
            }
          }

          await prisma.tINTUC.deleteMany({
            where: { maTinTuc: { in: newsId } }
          })
          return res.status(200).json({ message: 'Xóa tin tức thành công' })
        case 'hienThi':
          await prisma.tINTUC.updateMany({
            where: { maTinTuc: { in: newsId } },
            data: { hienThi: true }
          })
          return res.status(200).json({ message: 'Hiển thị tin tức thành công' })
        case 'an':
          await prisma.tINTUC.updateMany({
            where: { maTinTuc: { in: newsId } },
            data: { hienThi: false }
          })
          return res.status(200).json({ message: 'Ẩn tin tức thành công' })
        default:
          return res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/news/:id
  async updateNews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingNews = await prisma.tINTUC.findUnique({
        where: { maTinTuc: id },
      })
      if (!existingNews) {
        return res.status(404).json({ message: 'Tin tức không tồn tại' })
      }

      const { tieuDe, noiDung } = req.body
      const anhDaiDien = req.body.imageUrl

      if(anhDaiDien && anhDaiDien !== existingNews.anhDaiDien) {
        const { folderName, fileName } = parseS3Url(existingNews.anhDaiDien)
        await deleteFromS3(folderName, fileName)
      } else {
        req.body.anhDaiDien = existingNews.anhDaiDien
      }

      if(tieuDe && tieuDe !== existingNews.tieuDe) {
        req.body.slug = slugify(tieuDe, { lower: true, strict: true, locale: 'vi' })
      }

      const updatedNews = await prisma.tINTUC.update({
        where: { maTinTuc: id },
        data: {
          tieuDe,
          noiDung,
          anhDaiDien,
          slug: req.body.slug,
        },
        include: {
          nguoiDang: true,
        },
      })

      res.status(200).json({message: 'Cập nhật tin tức thành công', updatedNews})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật tin tức', error })
    }
  }

  // [PATCH] /admin/news/:id/show
  async toggleShowNews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingNews = await prisma.tINTUC.findUnique({
        where: { maTinTuc: id },
      })
      if (!existingNews) {
        return res.status(404).json({ message: 'Tin tức không tồn tại' })
      }
      const updatedNews = await prisma.tINTUC.update({
        where: { maTinTuc: id },
        data: { hienThi: !existingNews.hienThi },
      })
      res.status(200).json({ message: 'Cập nhật trạng thái hiển thị tin tức thành công', updatedNews })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/news/:id
  async deleteNews(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingNews = await prisma.tINTUC.findUnique({
        where: { maTinTuc: id },
        select: { anhDaiDien: true },
      })
      if (!existingNews) {
        return res.status(404).json({ message: 'Tin tức không tồn tại' })
      }

      const { folderName, fileName } = parseS3Url(existingNews.anhDaiDien)
      await deleteFromS3(folderName, fileName)

      await prisma.tINTUC.delete({
        where: { maTinTuc: id },
      })

      res.status(200).json({ message: 'Xóa tin tức thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
export default new TinTucsController()