import { model } from '@/config/googleAI'
import { prisma } from '@/lib/prisma'
import { getDayRange } from '@/utils/date.utils'
import { TypeDate, getDateRangeByType } from '@/utils/dateRange'

const askQuestion = async (question: string) => {
  try {
    const context = await getContextChatbot()
    const prompt = `Bạn là chatbot nhân viên tư vấn phim thông minh (Không hỗ trợ đặt vé). Đây là dữ liệu hiện có tại rạp:\n${context}
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
  const now = new Date()
  const today = new Date(now.toISOString().split("T")[0])

  let context = ""

  // Lấy dữ liệu phim và suất chiếu hôm nay
  const [allMovies, todayShowtimes] = await Promise.all([
    prisma.pHIM.findMany({
      where: { hienThi: true },
      include: {
        phimTheLoais: { include: { theLoai: true } },
        phanLoaiDoTuoi: true,
      },
      orderBy: { ngayKhoiChieu: "desc" },
    }),

    prisma.sUATCHIEU.findMany({
      where: {
        hoatDong: true,
        gioBatDau: { gte: startDate, lt: endDate },
      },
      include: {
        phim: {
          include: {
            phimTheLoais: { include: { theLoai: true } },
          },
        },
        phongChieu: {
          include: {
            rap: true,
            loaiPhongChieu: {
              include: {
                giaGhePhongs: {
                  include: { loaiGhe: true },
                  orderBy: { giaTien: "asc" },
                },
              },
            },
          },
        },
        gheSuatChieus: {
          include: {
            ghe: { include: { loaiGhe: true } },
          },
        },
      },
      orderBy: { gioBatDau: "asc" },
      take: 50,
    }),
  ])

  // Lấy mã phim có suất chiếu hôm nay
  const phimCoSuatHomNay = new Set<string>()
  todayShowtimes.forEach(sc => phimCoSuatHomNay.add(sc.maPhim))

  // Phân loại phim
  const phimDangChieuCoSuat: string[] = []
  const phimDangChieuKhongSuat: string[] = []
  const phimSapChieu: string[] = []

  allMovies.forEach(movie => {
    const genres = movie.phimTheLoais.map(pt => pt.theLoai.tenTheLoai).join(", ")
    const age = movie.phanLoaiDoTuoi.tenPhanLoaiDoTuoi

    const dangChieu =
      movie.ngayKhoiChieu <= today &&
      (!movie.ngayKetThuc || movie.ngayKetThuc >= today)

    const coSuatHomNay = phimCoSuatHomNay.has(movie.maPhim)

    if (dangChieu && coSuatHomNay) {
      phimDangChieuCoSuat.push(
        `- ${movie.tenPhim} (${genres} | ${age})`
      )
    } else if (dangChieu && !coSuatHomNay) {
      phimDangChieuKhongSuat.push(
        `- ${movie.tenPhim} (${genres} | ${age})`
      )
    } else if (movie.ngayKhoiChieu > today) {
      phimSapChieu.push(
        `- ${movie.tenPhim} (${genres} | ${age})`
      )
    }
  })

  // Lấy dữ liệu phim và suất chiếu hôm nay
  context += `🎬 PHIM CÓ SUẤT CHIẾU HÔM NAY:\n`
  if (phimDangChieuCoSuat.length) {
    context += phimDangChieuCoSuat.join("\n") + "\n"
  } else {
    context += "Không có phim nào đang chiếu hôm nay.\n"
  }

  context += `\n🎞 PHIM ĐANG CHIẾU NHƯNG HÔM NAY KHÔNG CÓ SUẤT:\n`
  context += phimDangChieuKhongSuat.length
    ? phimDangChieuKhongSuat.join("\n") + "\n"
    : "Không có.\n"

  context += `\n⏳ PHIM SẮP CHIẾU:\n`
  context += phimSapChieu.length
    ? phimSapChieu.join("\n") + "\n"
    : "Không có.\n"

  // Lấy dữ liệu phim và suất chiếu hôm nay
  context += `\n🎟 SUẤT CHIẾU HÔM NAY (CHI TIẾT):\n`
  todayShowtimes.forEach(showtime => {
    const movie = showtime.phim
    const genres = movie.phimTheLoais.map(pt => pt.theLoai.tenTheLoai).join(", ")

    const timeStr = new Date(showtime.gioBatDau).toLocaleTimeString("vi-VN",{ hour: "2-digit", minute: "2-digit" })

    const totalSeats = showtime.gheSuatChieus.length
    const emptySeats = showtime.gheSuatChieus.filter(g => g.trangThaiGhe === "DangTrong").length

    // Thống kê ghế theo loại
    const seatStats = Array.from(
      showtime.gheSuatChieus.reduce((map, s) => {
        const type = s.ghe.loaiGhe.tenLoaiGhe
        const [free, total] = map.get(type) || [0, 0]
        map.set(type, [
          free + (s.trangThaiGhe === "DangTrong" ? 1 : 0),
          total + 1,
        ])
        return map
      }, new Map<string, [number, number]>())
    )
    .map(([type, [free, total]]) => `${type}: ${free}/${total}`)
    .join(" | ")

    const prices = showtime.phongChieu.loaiPhongChieu.giaGhePhongs
    .map(p =>`${p.loaiGhe.tenLoaiGhe} ${Number(p.giaTien).toLocaleString("vi-VN")}đ`)
    .join(", ")

    context += `
      ${movie.tenPhim} (${genres})
      ${showtime.phongChieu.rap.tenRap} - ${showtime.phongChieu.tenPhong} | ${timeStr}
      Ghế trống: ${emptySeats}/${totalSeats}
      ${seatStats ? `Loại ghế: ${seatStats}\n` : ""}
      Giá vé: ${prices}
    `
  })

  return context
}

const revenueAnalysisAI = async (typeDate: TypeDate) => {
  try {
    const context = await getContextRevenue(typeDate)

    const prompt =
    `Bạn là một nhà phân tích doanh thu chuyên nghiệp. Hãy phân tích nhanh doanh thu rạp chiếu phim dựa trên dữ liệu sau (${typeDate}): ${context}
    Hãy phân tích ngắn gọn (150-250 từ) theo cấu trúc sau:
    1. Nhận xét tổng quan xu hướng doanh thu so với kỳ vọng (tăng/giảm/ổn định)
    2. Điểm mạnh nổi bật (phim nào hot, combo tốt, ...)
    3. Điểm yếu / rủi ro 
    4. 2-3 gợi ý hành động cụ thể, khả thi trong 1-4 tuần tới để cải thiện doanh thu

    Trả lời tự nhiên, chuyên nghiệp, các mục không xuống dòng dư,  tập trung insight thực tế cho quản trị viên.`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('Error in revenueAnalysisAI:', error)
    throw error
  }
}

const getContextRevenue = async (typeDate: TypeDate) => {
  const { start, end } = getDateRangeByType(typeDate)
  let context = `Thời gian phân tích: ${typeDate} ${start.toISOString().split("T")[0]} - Thời điểm hiện tại\n\n`

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
