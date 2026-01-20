import type { IStaff } from "@/types/staff"

export interface ITicket {
  maVe: string
  giaVe: number
  trangThai: "DaCheckIn" | "DaThanhToan" | "DaDat" | "DaHuy" | "DaHoanTien"
  thoiGianCheckIn?: string
  nhanVienSoatVe?: IStaff | null
  suatChieu: {
    maSuatChieu: string
    gioBatDau: string
    phongChieu: { tenPhong: string }
    phim: { tenPhim: string, anhBia: string, phienBan: string, ngonNgu: string }
    tenPhanLoaiDoTuoi: string
  }
  ghe: string[]
  gheSuatChieu: {
    ghe: {
      hangGhe: string
      soGhe: number
      loaiGhe: { tenLoaiGhe: string }
      phongChieu: {
        tenPhong: string
        rap: {
          tenRap: string
          diaChi: string
        }
      }
    }
    suatChieu: {
      gioBatDau: string
      phim: {
        tenPhim: string
        anhBia: string
        phienBan: 'TWO_D' | 'THREE_D'
        ngonNgu: 'LongTieng' | 'PhuDe'
      }
    }
  }
}

export interface ICombo {
  maCombo: string
  tenCombo: string
  anhCombo: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  nhanVienSoatBapNuoc?: IStaff | null
  chiTietCombos: [{
    maSanPham: string
    tenSanPham: string
    soLuong: number
  }]
}

export interface ISanPham {
  maSanPham: string
  tenSanPham: string
  anhSanPham: string
  soLuong: number
  donGia: number
  tongTien: number
  daLay: boolean
  thoiGianLay?: string
  nhanVienSoatBapNuoc?: IStaff | null
}

export interface IKhuyenMai {
  tenKhuyenMai: string
  maCode: string
  loaiKhuyenMai: 'GiamTien' | 'GiamPhanTram'
  giaTriGiam: number
}
