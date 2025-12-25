export function getMovieStatus(ngayKhoiChieu: Date, ngayKetThuc: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(ngayKhoiChieu)
  start.setHours(0, 0, 0, 0)

  const end = new Date(ngayKetThuc)
  end.setHours(23, 59, 59, 999)

  if (start > today) return "Sắp chiếu"
  if (end < today) return "Đã kết thúc"
  return "Đang chiếu"
}