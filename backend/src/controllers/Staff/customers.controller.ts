import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class KhachHangsController {

  // [GET] /staff/customers/check-phone
  async checkCustomerExists(req: Request, res: Response) {
    try {
      const { soDienThoai } = req.query
      if (!soDienThoai || typeof soDienThoai !== 'string') {
        return res.status(400).json({ message: 'Thiếu hoặc sai định dạng số điện thoại' })
      }
      
      const customer = await prisma.nGUOIDUNG.findUnique({
        where: { soDienThoai }
      })
      if (!customer) {
        return res.status(404).json({ message: 'Khách hàng không tồn tại' })
      }

      return res.status(200).json(customer)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
  
}

export default new KhachHangsController()