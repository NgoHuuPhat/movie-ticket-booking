import type { ITicket, IComboInvoices, ISanPham, IKhuyenMai } from "@/types/ticket"

export interface IInvoice {
  maHoaDon: string
  maQR: string
  maNguoiDung: string
  nguoiDung: {
    hoTen: string
    email: string
    soDienThoai: string
  } | null
  nhanVienBanVe?: {
    hoTen: string
    email: string
    soDienThoai: string
  } | null
  tongTien: number
  phuongThucThanhToan: "VNPAY" | "MOMO" | "TIENMAT"
  trangThaiThanhToan: "DaThanhToan" | "ChuaThanhToan"
  ngayThanhToan: string
  hinhThuc: "Online" | "Offline"
  hinhThucDatVe: "Online" | "Offline"
  maKhuyenMai?: string
  khuyenMai?: IKhuyenMai
  ves: ITicket[]
  combos: IComboInvoices[]
  hoaDonCombos: IComboInvoices[]
  sanPhams: ISanPham[]
  hoaDonSanPhams: ISanPham[]
}
