import { model } from '@/config/googleAI'
import { prisma } from '@/lib/prisma'
import { getDayRange } from '@/utils/date.utils'
import { TypeDate, getDateRangeByType } from '@/utils/dateRange'

const askQuestion = async (question: string) => {
  try {
    const context = await getContextChatbot()
    const prompt = `Bạn là nhân viên tư vấn phim thông minh (Không hỗ trợ đặt vé). Đây là dữ liệu hiện có tại rạp:\n${context}
    Câu hỏi của người dùng: ${question}. Hãy trả lời một cách tự nhiên thân thiện và ngắn gọn nhất`
    
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error in askQuestion:', error)
    throw error
  }
}

const getContextChatbot = async () => {
  const { startDate, endDate } = getDayRange()
  const today = new Date(new Date().toISOString().split('T')[0])
  let context = ''

  // Fetch all movies and today's showtimes in parallel
  const [allMovies, todayShowtimes, allRoomType] = await Promise.all([
    prisma.pHIM.findMany({
      where: { hienThi: true },
      include: { phimTheLoais: { include: { theLoai: true } }, phanLoaiDoTuoi: true },
      orderBy: { ngayKhoiChieu: 'desc' },
    }),
    prisma.sUATCHIEU.findMany({
      where: { hoatDong: true, gioBatDau: { gte: startDate, lt: endDate } },
      include: {
        phim: { include: { phimTheLoais: { include: { theLoai: true } } } },
        phongChieu: { include: { rap: true, loaiPhongChieu: { include: { giaGhePhongs: { include: { loaiGhe: true }, orderBy: { giaTien: 'asc' } } } } } },
        gheSuatChieus: { include: { ghe: { include: { loaiGhe: true } } } },
      },
      orderBy: { gioBatDau: 'asc' },
      take: 50,
    }),
    prisma.pHONGCHIEU.findMany({
      where: { hoatDong: true },
      include: { loaiPhongChieu: { include: { giaGhePhongs: { include: { loaiGhe: true } } } } },
    }),
  ])

  // List all movies
  allMovies.forEach(movie => {
    const genres = movie.phimTheLoais.map(pt => pt.theLoai.tenTheLoai).join(', ') 
    const ageRating = movie.phanLoaiDoTuoi.tenPhanLoaiDoTuoi                         
    const screeningStatus = movie.ngayKhoiChieu > today ? 'Sắp chiếu' :
      movie.ngayKetThuc < today ? 'Đã kết thúc' : 'Đang chiếu'

    context += `${screeningStatus}: ${movie.tenPhim} (${genres} | ${ageRating})\n`
  })

  // List room types and today's showtimes
  allRoomType.forEach(roomType => {
    context += `(${roomType.loaiPhongChieu.tenLoaiPhong}) có các phòng ${roomType.tenPhong}:\n`
    roomType.loaiPhongChieu.giaGhePhongs.forEach(price => {
      context += `- ${price.loaiGhe.tenLoaiGhe}: ${Number(price.giaTien).toLocaleString('vi-VN')}đ\n`
    })
  })
  context += "\n"

  // List today's showtimes 
  todayShowtimes.forEach(showtime => {
    const movie = showtime.phim
    const genres = movie.phimTheLoais.map(pt => pt.theLoai.tenTheLoai).join(', ')

    const showTime = new Date(showtime.gioBatDau)
    const showTimeStr = showTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

    const totalSeats = showtime.gheSuatChieus.length
    const emptySeats = showtime.gheSuatChieus.filter(seat => seat.trangThaiGhe === 'DangTrong').length

    const seatTypeDetails = Array.from(
      showtime.gheSuatChieus.reduce((seatMap, seat) => {
        const seatType = seat.ghe.loaiGhe.tenLoaiGhe
        const [free, total] = seatMap.get(seatType) || [0, 0]
        seatMap.set(seatType, [free + (seat.trangThaiGhe === 'DangTrong' ? 1 : 0), total + 1])
        return seatMap
      }, new Map<string, [number, number]>())
    )
    .map(([seatType, [free, total]]) => `${seatType} ${free}/${total}`)
    .join(' | ')

    const seatPrices = showtime.phongChieu.loaiPhongChieu.giaGhePhongs
      .map(price => `${price.loaiGhe.tenLoaiGhe} ${Number(price.giaTien).toLocaleString('vi-VN')}đ`)
      .join(', ')

    if (seatTypeDetails) context += `Loại ghế: ${seatTypeDetails}\n`

    context += `${movie.tenPhim} (${genres})\n`
    context += `${showtime.phongChieu.rap.tenRap} - ${showtime.phongChieu.tenPhong} ${showTimeStr}\n`
    context += `Ghế trống: ${emptySeats}/${totalSeats}\n`
    context += `Giá: ${seatPrices}\n\n`
  })

  return context
}

const revenueAnalysisAI = async (typeDate: TypeDate) => {
  try {
    const context = await getContextRevenue(typeDate)

    const prompt = `Bạn là chuyên gia phân tích dữ liệu kinh doanh rạp chiếu phim. Dữ liệu doanh thu kỳ ${typeDate}:\n${context}
    Hãy phân tích ngắn gọn (150-250 từ) theo cấu trúc sau:
    1. Nhận xét tổng quan xu hướng doanh thu so với kỳ vọng (tăng/giảm/ổn định)
    2. Điểm mạnh nổi bật (phim nào hot, combo tốt, ...)
    3. Điểm yếu / rủi ro 
    4. 2-3 gợi ý hành động cụ thể, khả thi trong 1-4 tuần tới để cải thiện doanh thu

    Trả lời tự nhiên, chuyên nghiệp, sử dụng ngôn ngữ tiếng Việt thân thiện nhưng có tính thuyết phục. Không bịa số liệu, chỉ dựa vào dữ liệu được cung cấp.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('Error in revenueAnalysisAI:', error)
    throw error
  }
}

const getContextRevenue = async (typeDate: TypeDate) => {
  const { start, end } = getDateRangeByType(typeDate)

  let context = `Thời gian phân tích: ${typeDate}\n\n`

  // Overview and key metrics
  const revenueSummary = await prisma.hOADON.aggregate({
    where: { ngayThanhToan: { gte: start, lt: end } },
    _sum: { tongTien: true },
    _count: { maHoaDon: true },
  })

  const totalRevenue = Number(revenueSummary._sum.tongTien || 0)
  const orderCount = revenueSummary._count.maHoaDon || 0
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

  context += `TỔNG QUAN:\n- Doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ\n- Số đơn hàng: ${orderCount}\n- Giá trị trung bình đơn: ${Math.round(avgOrderValue).toLocaleString('vi-VN')} VNĐ\n\n`

  // Revenue distribution by type
  const [ticketRevenue, comboRevenue, productRevenue] = await Promise.all([
    prisma.vE.aggregate({
      where: { hoaDon: { ngayThanhToan: { gte: start, lt: end } } },
      _sum: { giaVe: true },
    }),
    prisma.hOADON_COMBO.aggregate({
      where: { hoaDon: { ngayThanhToan: { gte: start, lt: end } } },
      _sum: { tongTien: true },
    }),
    prisma.hOADON_SANPHAM.aggregate({
      where: { hoaDon: { ngayThanhToan: { gte: start, lt: end } } },
      _sum: { tongTien: true },
    }),
  ])

  const ticketRev = Number(ticketRevenue._sum.giaVe || 0)
  const comboRev = Number(comboRevenue._sum.tongTien || 0)
  const foodRev = Number(productRevenue._sum.tongTien || 0)

  context += `PHÂN BỔ DOANH THU:\n`
  if (totalRevenue > 0) {
    context += `- Vé xem phim: ${ticketRev.toLocaleString('vi-VN')} VNĐ (${((ticketRev / totalRevenue) * 100).toFixed(1)}%)\n`
    context += `- Combo: ${comboRev.toLocaleString('vi-VN')} VNĐ (${((comboRev / totalRevenue) * 100).toFixed(1)}%)\n`
    context += `- Đồ ăn/uống lẻ: ${foodRev.toLocaleString('vi-VN')} VNĐ (${((foodRev / totalRevenue) * 100).toFixed(1)}%)\n\n`
  } else {
    context += `- Không có doanh thu trong kỳ này.\n\n`
  }

  // Top movies by ticket sales
  const topMovies = await prisma.pHIM.findMany({
    where: {
      suatChieus: {
        some: {
          gheSuatChieus: {
            some: { ve: { hoaDon: { ngayThanhToan: { gte: start, lt: end } } } },
          },
        },
      },
    },
    select: {
      maPhim: true,          
      tenPhim: true,
    },
    orderBy: {
      suatChieus: { _count: 'desc' },
    },
    take: 5,
  })

  // Calculate revenue for each top movie
  const movieRevenues = await Promise.all(
    topMovies.map(async (movie) => {
      const rev = await prisma.vE.aggregate({
        where: {
          gheSuatChieu: {
            suatChieu: { maPhim: movie.maPhim },  
          },
          hoaDon: { ngayThanhToan: { gte: start, lt: end } },
        },
        _sum: { giaVe: true },
      })
      return {
        tenPhim: movie.tenPhim,
        revenue: Number(rev._sum.giaVe || 0),
      }
    })
  )
  // Sort movies by revenue
  movieRevenues.sort((a, b) => b.revenue - a.revenue)

  context += `TOP PHIM THEO DOANH THU VÉ:\n`
  if (movieRevenues.length > 0) {
    movieRevenues.slice(0, 5).forEach((m, i) => {
      context += `${i + 1}. ${m.tenPhim}: ${m.revenue.toLocaleString('vi-VN')} VNĐ\n`
    })
  } else {
    context += `- Chưa có phim nào bán vé trong kỳ.\n`
  }
  context += '\n'

  // Payment methods
  const paymentMethods = await prisma.hOADON.groupBy({
    where: { ngayThanhToan: { gte: start, lt: end } },
    by: ['phuongThucThanhToan'],
    _sum: { tongTien: true },
    _count: { phuongThucThanhToan: true },
    orderBy: { _sum: { tongTien: 'desc' } },
  })

  context += `PHƯƠNG THỨC THANH TOÁN:\n`
  paymentMethods.forEach((pm) => {
    context += `- ${pm.phuongThucThanhToan}: ${Number(pm._sum.tongTien || 0).toLocaleString('vi-VN')} VNĐ (${pm._count.phuongThucThanhToan} đơn)\n`
  })

  return context
}

export { askQuestion, revenueAnalysisAI }
