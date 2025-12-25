import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { generateIncrementalId } from '@/utils/generateId.utils'
import { parseS3Url } from '@/utils/s3.utils'
import { deleteFromS3 } from '@/services/s3.service'

class SanPhamsController {

  // [GET] /admin/products
  async getAllProducts(req: Request, res: Response) {
    try {
      const { hienThi, maDanhMucSanPham, search, page = 1, sortField = 'maSanPham', sortOrder = 'asc' } = req.query
      const limit = 10
      const filter: any = {}
      const skip = (Number(page) - 1) * limit
      const sortFields = sortField as string

      if(hienThi !== undefined) {
        filter.hienThi = hienThi === 'true'
      }

      if(maDanhMucSanPham) {
        filter.maDanhMucSanPham = maDanhMucSanPham
      }

      if(search) {
        filter.tenSanPham = {
          contains: search as string,
          mode: 'insensitive',
        }
      }

      const [products, total] = await Promise.all([
        prisma.sANPHAM.findMany({
          where: filter,
          orderBy: { [sortFields]: sortOrder },
          skip,
          take: limit,
          include: {
            danhMucSanPham: true, 
          },
        }),
        prisma.sANPHAM.count({ where: filter }),
      ])
      const startIndex = skip + 1
      const endIndex = Math.min(Number(page) * Number(limit), total)

      return res.status(200).json({ products, total, startIndex, endIndex, page: Number(page), totalPages: Math.ceil(total / Number(limit)) })
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error })
    }
  }

  // [GET] /admin/products/select
  async getProductsForSelect(req: Request, res: Response) {
    try {
      const products = await prisma.sANPHAM.findMany({
        where: { hienThi: true },
        orderBy: { maSanPham: 'asc' },
        select: { maSanPham: true, tenSanPham: true, giaTien: true, anhSanPham: true },
      })

      res.status(200).json(products)
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy sản phẩm cho select', error })
    }
  }

  // [POST] /admin/products
  async createProduct(req: Request, res: Response) {
    try {
      const { tenSanPham, maDanhMucSanPham, giaTien } = req.body
      const anhSanPham = req.body.imageUrl
      if(!anhSanPham) {
        return res.status(400).json({ message: 'Ảnh sản phẩm là bắt buộc' })
      }

      const maSanPham = await generateIncrementalId(prisma.sANPHAM, 'maSanPham', 'SP')
      const newProduct = await prisma.sANPHAM.create({
        data: {
          maSanPham,
          tenSanPham,
          maDanhMucSanPham,
          anhSanPham,
          giaTien: Number(giaTien),
        },
        include: { danhMucSanPham: true },
      })
      res.status(201).json({ message: 'Tạo sản phẩm thành công', newProduct })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error })
    }
  }

  // [POST] /admin/products/bulk-action
  async bulkAction(req: Request, res: Response) {
    try {
      const { action, productIds } = req.body

      switch (action) {
        case 'xoa':
          const productsToDelete = await prisma.sANPHAM.findMany({
            where: { maSanPham: { in: productIds } },
            select: { anhSanPham: true }
          })
          for (const product of productsToDelete) {
            if (product.anhSanPham) {
              const { folderName, fileName } = parseS3Url(product.anhSanPham)
              await deleteFromS3(folderName, fileName)
            }
          }

          await prisma.sANPHAM.deleteMany({
            where: { maSanPham: { in: productIds } }
          })
          return res.status(200).json({ message: 'Xóa sản phẩm thành công' })
        case 'hienThi':
          await prisma.sANPHAM.updateMany({
            where: { maSanPham: { in: productIds } },
            data: { hienThi: true }
          })
          return res.status(200).json({ message: 'Hiển thị sản phẩm thành công' })
        case 'an':
          await prisma.sANPHAM.updateMany({
            where: { maSanPham: { in: productIds } },
            data: { hienThi: false }
          })
          return res.status(200).json({ message: 'Ẩn sản phẩm thành công' })
        default:
          return res.status(400).json({ message: 'Hành động không hợp lệ' })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi thực hiện bulk action', error })
    }
  }

  // [PATCH] /admin/products/:id
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingProduct = await prisma.sANPHAM.findUnique({
        where: { maSanPham: id },
      })
      if (!existingProduct) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
      }

      const { maDanhMucSanPham, tenSanPham, giaTien } = req.body
      const anhSanPham = req.body.imageUrl

      if(anhSanPham && anhSanPham !== existingProduct.anhSanPham) {
        const { folderName, fileName } = parseS3Url(existingProduct.anhSanPham)
        await deleteFromS3(folderName, fileName)
      } else {
        req.body.anhSanPham = existingProduct.anhSanPham
      }

      const updatedProduct = await prisma.sANPHAM.update({
        where: { maSanPham: id },
        data: {
          tenSanPham,
          maDanhMucSanPham,
          anhSanPham,
          giaTien: Number(giaTien),
        },
        include: { danhMucSanPham: true },
      })
      res.status(200).json({message: 'Cập nhật sản phẩm thành công', updatedProduct})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error })
    }
  }

  // [PATCH] /admin/products/:id/show
  async toggleShowProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingProduct = await prisma.sANPHAM.findUnique({
        where: { maSanPham: id },
      })
      if (!existingProduct) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
      }
      const updatedProduct = await prisma.sANPHAM.update({
        where: { maSanPham: id },
        data: { hienThi: !existingProduct.hienThi },
      })
      res.status(200).json({ message: 'Cập nhật trạng thái hiển thị sản phẩm thành công', updatedProduct })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái hiển thị sản phẩm', error })
    }
  }

  // [DELETE] /admin/products/:id
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const existingProduct = await prisma.sANPHAM.findUnique({
        where: { maSanPham: id },
        select: { anhSanPham: true },
      })
      if (!existingProduct) {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại' })
      }

      const { folderName, fileName } = parseS3Url(existingProduct.anhSanPham)
      await deleteFromS3(folderName, fileName)

      await prisma.sANPHAM.delete({
        where: { maSanPham: id },
      })

      res.status(200).json({ message: 'Xóa sản phẩm thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error })
    }
  }
}
export default new SanPhamsController()