export interface IBanner {
  maBanner: string
  anhBanner: string
  duongDanLienKet: string | null
  viTriHienThi: string | number
  hienThi?: boolean
  ngayTao: string
  nguoiTao?: {
    maNguoiDung: string
    hoTen: string
  }
}
