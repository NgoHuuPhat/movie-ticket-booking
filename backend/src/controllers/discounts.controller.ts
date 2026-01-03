import { Response } from 'express'
import { prisma } from '@/lib/prisma'
import { IUserRequest } from '@/types/user'
import { getDayRange } from '@/utils/date.utils'

class MaKhuyenMaisController {

  // [POST] /discounts/check
  async checkDiscountCode(req: IUserRequest, res: Response) {
    try {
      const { maCode, tongTien } = req.body
      const currentUserType = req.user?.maLoaiNguoiDung
      const { startDate, endDate } = getDayRange()
      const discount = await prisma.kHUYENMAI.findUnique({ where: { maCode }})

      if (!discount || !discount.hoatDong || discount.ngayBatDau > endDate) {
        return res.status(404).json({ message: 'Mã khuyến mãi không tồn tại' })
      }
      if (discount.ngayKetThuc < startDate) {
        return res.status(400).json({ message: 'Mã khuyến mãi đã hết hạn' })
      }
      if (discount.soLuong !== null && discount.soLuongDaDung >= discount.soLuong) {
        return res.status(400).json({ message: 'Mã khuyến mãi đã hết lượt sử dụng' })
      }
      if (discount.maLoaiNguoiDung && discount.maLoaiNguoiDung !== currentUserType) {
        return res.status(400).json({ message: 'Mã khuyến mãi không áp dụng cho loại người dùng này' })
      }
      const userUsedDiscount = await prisma.hOADON.findFirst({
        where: {
          maKhuyenMai: discount.maKhuyenMai,
          maNguoiDung: req.user?.maNguoiDung
        }
      })
      if(userUsedDiscount) {
        return res.status(400).json({ message: 'Bạn đã sử dụng mã khuyến mãi này trước đó' })
      }
      if (discount.donHangToiThieu && tongTien < discount.donHangToiThieu) {
        return res.status(400).json({ message: `Đơn hàng tối thiểu để áp dụng mã khuyến mãi là ${Number(discount.donHangToiThieu).toLocaleString()} VNĐ` })
      }

      return res.status(200).json({ 
        message: 'Áp dụng mã khuyến mãi thành công',
        discount: {
          maCode: discount.maCode,
          maKhuyenMai: discount.maKhuyenMai,
          tenKhuyenMai: discount.tenKhuyenMai,
          loaiKhuyenMai: discount.loaiKhuyenMai,
          giaTriGiam: discount.giaTriGiam,
          giamToiDa: discount.giamToiDa,
        },
      })
    } catch (error) {
      console.error( error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new MaKhuyenMaisController()