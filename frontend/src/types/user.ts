export interface IUser {
  maNguoiDung: string
  hoTen: string
  email: string
  soDienThoai: string
  ngaySinh: string
  gioiTinh: "Nam" | "Nu"
  ngayTao: string
  diemTichLuy: number
  maLoaiNguoiDung: "KH" | "ADMIN" | "VIP" | "NV"
}

export type BulkAction = "activate" | "deactivate" | "delete"