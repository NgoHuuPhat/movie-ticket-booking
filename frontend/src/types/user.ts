export interface IUserType {
  maLoaiNguoiDung: 'ADMIN' | 'KH' | 'NV' | 'VIP'
  tenLoaiNguoiDung: string
}

export interface IUser {
  maNguoiDung: string
  hoTen: string
  email: string
  soDienThoai: string
  ngaySinh: string
  gioiTinh: "Nam" | "Nu"
  ngayTao: string
  hoatDong: boolean
  diemTichLuy: number
  maLoaiNguoiDung: "KH" | "ADMIN" | "VIP" | "NV"
  loaiNguoiDung: IUserType
}

export type BulkAction = "activate" | "deactivate" | "delete"