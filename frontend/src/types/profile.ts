import type { IKhuyenMai } from "@/types/ticket"
import type { INhanVien } from "@/types/staff"

export interface IUserProfile {
  hoTen: string
  email: string
  soDienThoai: string
  diaChi?: string
  ngaySinh?: string
  gioiTinh?: string
  avatar?: string
  diemTichLuy: number
  capBac?: string
  ngayThamGia?: string
}

export interface IPhim {
  tenPhim: string
  anhBia: string
  phienBan: 'TWO_D' | 'THREE_D'
  ngonNgu: 'LongTieng' | 'PhuDe'
}

export interface ILoaiGhe {
  tenLoaiGhe: string
}

export interface IRap {
  tenRap: string
  diaChi: string
}

export interface IPhongChieu {
  tenPhong: string
  rap: IRap
}

export interface IGhe {
  hangGhe: string
  soGhe: number
  loaiGhe: ILoaiGhe
  phongChieu: IPhongChieu
}

export interface ISuatChieu {
  gioBatDau: string
  phim: IPhim
}

export interface IGheSuatChieu {
  ghe: IGhe
  suatChieu: ISuatChieu
}

export interface IVe {
  maVe: string
  giaVe: number
  trangThai: 'DaCheckIn' | 'DaThanhToan'
  thoiGianCheckIn?: string
  gheSuatChieu: IGheSuatChieu
  nhanVienSoatVe?: INhanVien
}

export interface ICombo {
  tenCombo: string
  anhCombo: string
}

export interface IHoaDonCombo {
  maCombo: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  combo: ICombo
  nhanVienSoatBapNuoc?: INhanVien
}

export interface ISanPham {
  tenSanPham: string
  anhSanPham: string
}

export interface IHoaDonSanPham {
  maSanPham: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  sanPham: ISanPham
  nhanVienSoatBapNuoc?: INhanVien
}

export interface IHoaDon {
  maHoaDon: string
  maQR: string
  tongTien: number
  phuongThucThanhToan: 'VNPAY' | 'TIENMAT'
  ngayThanhToan: string
  hinhThucDatVe: 'Online' | 'Offline'
  khuyenMai?: IKhuyenMai
  nhanVienBanVe?: INhanVien
  ves: IVe[]
  hoaDonCombos: IHoaDonCombo[]
  hoaDonSanPhams: IHoaDonSanPham[]
}
