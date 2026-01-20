export interface INews {
  maTinTuc: string
  tieuDe: string
  noiDung: string
  anhDaiDien: string
  ngayDang: string
  slug?: string
  hienThi?: boolean
  nguoiDang?: {
    maNguoiDung: string
    hoTen: string
  }
  daGuiMail?: boolean
  thoiGianGuiMail?: string | null
}