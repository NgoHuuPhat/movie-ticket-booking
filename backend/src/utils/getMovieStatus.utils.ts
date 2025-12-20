
export function getMovieStatus(ngayKhoiChieu: Date, ngayKetThuc: Date): "Đang chiếu" | "Sắp chiếu" | "Đã kết thúc" {
  const today = new Date()
  const start = new Date(ngayKhoiChieu)
  const end = new Date(ngayKetThuc)

  if (start > today) return "Sắp chiếu"
  if (end < today) return "Đã kết thúc"
  return "Đang chiếu"
}
