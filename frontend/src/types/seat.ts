export interface ISeatData {
  maGhe: string
  hangGhe: string
  soGhe: number
  tenLoaiGhe: "Standard" | "Couple" | "VIP"
  giaTien: number
  trangThai: "DangTrong" | "DaDat" | "KhongSuDung"
}

export interface ISeatType {
  maLoaiGhe: string
  tenLoaiGhe: string
  moTa?: string
}

export interface ISeat {
  maGhe: string
  maPhong: string
  hangGhe: string
  soGhe: number
  maLoaiGhe: string
  hoatDong: boolean
}

export interface ISeatPrice {
  maLoaiPhong: string
  maLoaiGhe: string
  giaTien: number
  loaiGhe: { tenLoaiGhe: string }
  loaiPhongChieu: { tenLoaiPhong: string }
}