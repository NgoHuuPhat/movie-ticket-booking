export interface IDiscount {
  tenKhuyenMai: string
  maCode: string
  moTa: string
  giaTriGiam: number
  giamToiDa?: number
  donHangToiThieu: number
  loaiKhuyenMai: "GiamPhanTram" | "GiamTien"
}

export interface IDiscountAdmin {
  maKhuyenMai: string
  tenKhuyenMai: string
  maCode: string
  loaiKhuyenMai: "GiamPhanTram" | "GiamTien"
  giaTriGiam: number
  giamToiDa?: number
  donHangToiThieu: number 
  maLoaiNguoiDung?: string
  soLuong: number
  soLuongDaDung: number
  ngayBatDau: string
  ngayKetThuc: string
  hoatDong: boolean
  moTa?: string
  loaiNguoiDung?: { tenLoaiNguoiDung: string }
}