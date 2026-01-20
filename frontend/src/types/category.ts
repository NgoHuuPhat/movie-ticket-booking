export interface IProductCategory {
  maDanhMucSanPham: string
  tenDanhMucSanPham: string
  _count?: {
    sanPhams: number
  }
}

export interface ICategory {
  maDanhMucSanPham: string
  tenDanhMucSanPham: string
}
