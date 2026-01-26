import type { ICategory } from "@/types/category"

export interface IProduct {
  maSanPham: string
  tenSanPham: string
  anhSanPham: string
  giaTien: number
  hienThi: boolean
  danhMucSanPham: ICategory
}

export interface ICategoryWithProducts {
  maDanhMucSanPham: string
  tenDanhMucSanPham: string
  sanPhams: IProduct[]
}

export interface IDetailCombo {
  maSanPham: string
  tenSanPham: string
  anhSanPham: string
  giaTien: number
  soLuong: number
}

export interface ICombo {
  maCombo: string
  tenCombo: string
  anhCombo: string
  giaGoc: number
  giaBan: number
  chiTietCombos: IDetailCombo[]
}

export interface ISelectedFood {
  maSanPham: string
  tenSanPham: string
  donGia: number
  soLuong: number
  loai: "sanpham" | "combo"
}

export interface IAdminComboDetail {
  maSanPham: string
  soLuong: number
  sanPham: {
    maSanPham: string
    tenSanPham: string
    giaTien: number
    anhSanPham: string
  }
}

export interface IAdminCombo {
  maCombo: string
  tenCombo: string
  anhCombo: string
  giaGoc: number
  giaBan: number
  hienThi: boolean
  chiTietCombos: IAdminComboDetail[]
}