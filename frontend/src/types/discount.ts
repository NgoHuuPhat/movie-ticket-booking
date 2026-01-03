export interface IDiscount {
  tenKhuyenMai: string
  maCode: string
  moTa: string
  giaTriGiam: number
  giamToiDa?: number
  donHangToiThieu: number
  loaiKhuyenMai: "GiamPhanTram" | "GiamTien"
}