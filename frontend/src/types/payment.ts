export interface IProduct {
  maSanPham: string
  soLuong: number
  donGia: number
  loai: 'combo' | 'sanpham'
}

export interface IPaymentRequestBody {
  maSuatChieu: string
  selectedSeats: { maGhe: string; giaTien: number }[]
  selectedFoods: IProduct[]
  maCodeKhuyenMai?: string
  tongTien: number
  soDienThoaiNguoiDung?: string
}
