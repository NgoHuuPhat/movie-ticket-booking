export interface IProductBooking {
  maSanPham: string
  soLuong: number
  donGia: number
  loai: 'combo' | 'sanpham'
}

export interface IVNPayRequestBody {
  maPhim: string
  maSuatChieu: string
  selectedSeats: { maGhe: string; giaTien: number }[]
  selectedFoods: IProductBooking[]
  maCodeKhuyenMai?: string
  tongTien: number
}

export interface ITicketData {
  maQR: string 
  tenPhim: string
  phongChieu: string
  ngayChieu: string
  gioChieu: string
  ghe: string[]
  thoiGianThanhToan: string
  tienComboBapNuoc?: number
  tongTien: number
  soTienGiamGia?: number
  soTienThanhToan: number
}