import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { parseS3Url } from '@/utils/s3.utils'
import { deleteFromS3 } from '@/services/s3.service'
import { IUserRequest } from '@/types/user'

class BannersController {

  // [GET] /admin/banners
  async getAllBanners(req: Request, res: Response) {
    try {
      const banners = await prisma.bANNERQUANGCAO.findMany({include: { nguoiTao: true }})
      return res.status(200).json(banners)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/banners
  async createBanner(req: IUserRequest, res: Response) {
    try {
      const { duongDanLienKet, viTriHienThi } = req.body
      const maNguoiTao = req.user?.maNguoiDung
      const anhBanner = req.body.imageUrl
      
      if(!anhBanner) {
        return res.status(400).json({ message: 'Ảnh banner là bắt buộc' })
      }
      if(!maNguoiTao) {
        return res.status(401).json({ message: 'Người dùng không hợp lệ' })
      }

      const maBanner = await generateIncrementalId(prisma.bANNERQUANGCAO, 'maBanner', 'BN')
      const newBanner = await prisma.bANNERQUANGCAO.create({
        data: {
          maBanner,
          anhBanner,
          duongDanLienKet,
          viTriHienThi: Number(viTriHienThi),
          maNguoiTao,
        },
        include: {
          nguoiTao: true,
        },
      })

      res.status(201).json({ message: 'Tạo banner thành công', newBanner })
    } catch (error: any) {
      if(error.code === 'P2002') {
        return res.status(400).json({ message: 'Vị trí hiển thị banner đã được sử dụng' })
      }
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /admin/banners/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { action, bannerIds } = req.body

      switch (action) {
        case 'xoa':
          const bannersToDelete = await prisma.bANNERQUANGCAO.findMany({
            where: { maBanner: { in: bannerIds } },
            select: { anhBanner: true }
          })
          for (const banner of bannersToDelete) {
            if (banner.anhBanner) {
              const { folderName, fileName } = parseS3Url(banner.anhBanner)
              await deleteFromS3(folderName, fileName)
            }
          }

          await prisma.bANNERQUANGCAO.deleteMany({
            where: { maBanner: { in: bannerIds } }
          })
          return res.status(200).json({ message: 'Xóa banner thành công' })
        case 'hienThi':
          await prisma.bANNERQUANGCAO.updateMany({
            where: { maBanner: { in: bannerIds } },
            data: { hienThi: true }
          })
          return res.status(200).json({ message: 'Hiển thị banner thành công' })
        case 'an':
          await prisma.bANNERQUANGCAO.updateMany({
            where: { maBanner: { in: bannerIds } },
            data: { hienThi: false }
          })
          return res.status(200).json({ message: 'Ẩn banner thành công' })
        default:
          return res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/banners/:id
  async updateBanner(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingBanner = await prisma.bANNERQUANGCAO.findUnique({
        where: { maBanner: id },
      })
      if (!existingBanner) {
        return res.status(404).json({ message: 'Banner không tồn tại' })
      }

      const { duongDanLienKet, viTriHienThi } = req.body
      const anhBanner = req.body.imageUrl

      if(anhBanner && anhBanner !== existingBanner.anhBanner) {
        const { folderName, fileName } = parseS3Url(existingBanner.anhBanner)
        await deleteFromS3(folderName, fileName)
      } else {
        req.body.anhBanner = existingBanner.anhBanner
      }

      const updatedBanner = await prisma.bANNERQUANGCAO.update({
        where: { maBanner: id },
        data: {
          duongDanLienKet,
          viTriHienThi: Number(viTriHienThi),
          anhBanner,
        },
        include: {
          nguoiTao: true,
        },
      })

      res.status(200).json({message: 'Cập nhật banner thành công', updatedBanner})
    } catch (error: any) {
      if(error.code === 'P2002') {
        return res.status(400).json({ message: 'Vị trí hiển thị banner đã được sử dụng' })
      }
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [PATCH] /admin/banners/:id/show
  async toggleShowBanner(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingBanner = await prisma.bANNERQUANGCAO.findUnique({
        where: { maBanner: id },
      })
      if (!existingBanner) {
        return res.status(404).json({ message: 'Banner không tồn tại' })
      }
      const updatedBanner = await prisma.bANNERQUANGCAO.update({
        where: { maBanner: id },
        data: { hienThi: !existingBanner.hienThi },
      })
      res.status(200).json({ message: 'Cập nhật trạng thái hiển thị banner thành công', updatedBanner })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [DELETE] /admin/banners/:id
  async deleteBanner(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingBanner = await prisma.bANNERQUANGCAO.findUnique({
        where: { maBanner: id },
        select: { anhBanner: true },
      })
      if (!existingBanner) {
        return res.status(404).json({ message: 'Banner không tồn tại' })
      }

      const { folderName, fileName } = parseS3Url(existingBanner.anhBanner)
      await deleteFromS3(folderName, fileName)

      await prisma.bANNERQUANGCAO.delete({
        where: { maBanner: id },
      })

      res.status(200).json({ message: 'Xóa banner thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
export default new BannersController()