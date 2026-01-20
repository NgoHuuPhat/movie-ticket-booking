export interface IShowtime {
  maSuatChieu: string
  maPhim: string
  maPhong: string
  phim: { 
    tenPhim: string
    ngayKhoiChieu: string
    ngayKetThuc: string 
  }
  phongChieu: { tenPhong: string }
  gioBatDau: string
  gioKetThuc: string
  hoatDong: boolean
  trangThai: "Sắp chiếu" | "Đang chiếu" | "Đã kết thúc"
}
