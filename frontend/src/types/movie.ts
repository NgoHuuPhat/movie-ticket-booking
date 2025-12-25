
export interface IMovie {
  maPhim: string
  tenPhim: string
  daoDien: string
  dienVien: string
  thoiLuong: number
  moTa: string
  anhBia: string
  ngayKhoiChieu: string
  ngayKetThuc: string
  tenPhanLoaiDoTuoi: string
  trailerPhim: string
  quocGia: string
  phienBan: string
  ngonNgu: string
  slug: string
  moTaPhanLoaiDoTuoi?: string
  theLoais: string[]
}

export interface IPhimCardProps {
  movie: IMovie
  isComingSoon: boolean  
  onWatchTrailer: () => void
}

export interface ITrailerModalProps {
  show: boolean
  trailerId: string
  onClose: () => void
}

export interface IMovieShowtime {
  maSuatChieu: string
  maPhim: string
  gioBatDau: string
  gioKetThuc: string
  tenLoaiPhong: string
  tenPhongChieu: string
}

export interface IGroupedShowtime {
  [date: string]: {
    [roomType: string]: IMovieShowtime[]
  }
}