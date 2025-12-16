import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class CombosController {

  // [GET] /combos
  async getAllCombo(req: Request, res: Response) {
    try {
        const result = (await prisma.cOMBO.findMany({
          where: { hienThi: true },
          include: { chiTietCombos: {
            include: { sanPham: true }
          } },
        })).map(({ hienThi, ...combo }) => ({
          ...combo,
          chiTietCombos: combo.chiTietCombos.map(ct => ({
            maSanPham: ct.sanPham.maSanPham,
            tenSanPham: ct.sanPham.tenSanPham,
            anhSanPham: ct.sanPham.anhSanPham,
            giaTien: ct.sanPham.giaTien,
            soLuong: ct.soLuong,
          }))
        }))
        
        return res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new CombosController()