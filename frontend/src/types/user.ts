export interface User {
  maNguoiDung: string
  hoTen: string
  email: string
  soDienThoai: string
  ngaySinh: string
  gioiTinh: "Nam" | "Nu"
  anhDaiDien?: string
  ngayTao: string
}