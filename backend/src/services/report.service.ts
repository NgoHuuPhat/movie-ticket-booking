import { Response } from 'express'
import puppeteer from 'puppeteer'
import { prisma } from '@/lib/prisma'
import { getDateRangeByType } from '@/utils/dateRange'

interface RevenueData {
  totalRevenue: number
  totalInvoices: number
  totalTickets: number
  totalProductOrders: number
  totalTicketsRevenue: number
  onlineRevenue: number
  offlineRevenue: number
  vnpayRevenue: number
  cashRevenue: number
  comboRevenue: number
  productRevenue: number
  cinemaInfo: {
    tenRap: string
    diaChi: string
    soDienThoai: string
    email: string
  }
  
  topMovies: Array<{
    tenPhim: string
    soVe: number
    doanhThu: number
  }>
  
  dailyRevenue: Array<{
    ngay: string
    doanhThu: number
    soVe: number
  }>
  
  invoicesByStatus: Array<{
    trangThai: string
    soLuong: number
    doanhThu: number
  }>
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function getRevenueStatistics(start: Date, end: Date): Promise<RevenueData> {
  const hoaDons = await prisma.hOADON.findMany({
    where: {
      ngayThanhToan: {
        gte: start,
        lt: end
      }
    },
    include: {
      ves: {
        include: {
          gheSuatChieu: {
            include: {
              suatChieu: {
                include: {
                  phim: true
                }
              }
            }
          }
        }
      },
      hoaDonCombos: true,
      hoaDonSanPhams: true
    }
  })

  const cinemaInfo = await prisma.rAP.findFirst()

  // Tổng doanh thu
  const totalRevenue = hoaDons.reduce((sum, hd) => sum + Number(hd.tongTien), 0)
  const totalInvoices = hoaDons.length
  const totalTickets = hoaDons.reduce((sum, hd) => sum + hd.ves.length, 0)

  // Tính tổng số đơn hàng sản phẩm (combos + sản phẩm lẻ)
  const totalProductOrders = hoaDons.reduce((sum, hd) => {
    return sum + hd.hoaDonCombos.length + hd.hoaDonSanPhams.length
  }, 0)

  // Doanh thu theo hình thức
  const onlineRevenue = hoaDons
    .filter(hd => hd.hinhThucDatVe === 'Online')
    .reduce((sum, hd) => sum + Number(hd.tongTien), 0)
  
  const offlineRevenue = hoaDons
    .filter(hd => hd.hinhThucDatVe === 'Offline')
    .reduce((sum, hd) => sum + Number(hd.tongTien), 0)

  // Doanh thu theo phương thức thanh toán
  const vnpayRevenue = hoaDons
    .filter(hd => hd.phuongThucThanhToan === 'VNPAY')
    .reduce((sum, hd) => sum + Number(hd.tongTien), 0)
  
  const cashRevenue = hoaDons
    .filter(hd => hd.phuongThucThanhToan === 'TIENMAT')
    .reduce((sum, hd) => sum + Number(hd.tongTien), 0)
  
  // Doanh thu vé xem phim
  const totalTicketsRevenue = hoaDons.reduce((sum, hd) => {
    return sum + hd.ves.reduce((s, v) => s + Number(v.giaVe), 0)
  }, 0)

  // Doanh thu combo và sản phẩm
  const comboRevenue = hoaDons.reduce((sum, hd) => {
    return sum + hd.hoaDonCombos.reduce((s, c) => s + Number(c.tongTien), 0)
  }, 0)

  const productRevenue = hoaDons.reduce((sum, hd) => {
    return sum + hd.hoaDonSanPhams.reduce((s, p) => s + Number(p.tongTien), 0)
  }, 0)

  // Top phim theo doanh thu
  const movieRevenue = new Map<string, { soVe: number; doanhThu: number }>()
  
  hoaDons.forEach(hd => {
    hd.ves.forEach(ve => {
      const tenPhim = ve.gheSuatChieu.suatChieu.phim.tenPhim
      const current = movieRevenue.get(tenPhim) || { soVe: 0, doanhThu: 0 }
      movieRevenue.set(tenPhim, {
        soVe: current.soVe + 1,
        doanhThu: current.doanhThu + Number(ve.giaVe)
      })
    })
  })

  const topMovies = Array.from(movieRevenue.entries())
    .map(([tenPhim, data]) => ({ tenPhim, ...data }))
    .sort((a, b) => b.doanhThu - a.doanhThu)
    .slice(0, 5)

  // Doanh thu theo ngày
  const dailyRevenueMap = new Map<string, { doanhThu: number; soVe: number }>()
  
  hoaDons.forEach(hd => {
    const ngay = new Date(hd.ngayThanhToan).toLocaleDateString('en-CA')
    const current = dailyRevenueMap.get(ngay) || { doanhThu: 0, soVe: 0 }
    dailyRevenueMap.set(ngay, {
      doanhThu: current.doanhThu + Number(hd.tongTien),
      soVe: current.soVe + hd.ves.length
    })
  })

  const dailyRevenue = Array.from(dailyRevenueMap.entries())
    .map(([ngay, data]) => ({ ngay, ...data }))
    .sort((a, b) => a.ngay.localeCompare(b.ngay))

  // Thống kê theo trạng thái vé
  const veStats = await prisma.vE.groupBy({
    by: ['trangThai'],
    where: {
      hoaDon: {
        ngayThanhToan: {
          gte: start,
          lt: end
        }
      }
    },
    _count: true,
    _sum: {
      giaVe: true
    }
  })

  const invoicesByStatus = veStats.map(stat => ({
    trangThai: stat.trangThai === 'DaCheckIn' ? 'Đã check-in' : 'Đã thanh toán',
    soLuong: stat._count,
    doanhThu: Number(stat._sum.giaVe || 0)
  }))

  return {
    totalRevenue,
    totalInvoices,
    totalTickets,
    totalProductOrders,
    onlineRevenue,
    offlineRevenue,
    vnpayRevenue,
    cashRevenue,
    totalTicketsRevenue,
    comboRevenue,
    productRevenue,
    topMovies,
    dailyRevenue,
    invoicesByStatus,
    cinemaInfo: {
      tenRap: cinemaInfo?.tenRap || 'Rạp Chiếu Phim Lê Độ',
      diaChi: cinemaInfo?.diaChi || '46 Trần Phú, Hải Châu, Đà Nẵng',
      soDienThoai: cinemaInfo?.soDienThoai || '02363822574',
      email: cinemaInfo?.email || 'ttphpcbdn@gmail.com'
    }
  }
}

function generateReportHTML(data: RevenueData, start: Date, end: Date): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {  font-family: 'Times New Roman', Times, serif;  font-size: 14px; color: #000; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #97027e; }
        .company-name { font-family: 'Times New Roman', Times, serif; font-size: 18px; font-weight: bold; text-transform: uppercase; color: #97027e; margin-bottom: 5px; }
        .company-info { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #666; margin-bottom: 3px; }
        .report-title { font-family: 'Times New Roman', Times, serif; font-size: 30px; font-weight: bold; text-transform: uppercase; margin-top: 12px; margin-bottom: 5px; }
        .report-period { font-family: 'Times New Roman', Times, serif; font-size: 14px; font-style: italic; color: #666; }
        .section { margin: 25px 0; page-break-inside: avoid; }
        .section-title { font-family: 'Times New Roman', Times, serif; font-size: 16px; font-weight: bold; text-transform: uppercase; background-color: #f3f4f6; padding: 10px 14px; margin-bottom: 15px; border-left: 4px solid #97027e; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .summary-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; }
        .summary-label { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .summary-value { font-family: 'Times New Roman', Times, serif; font-size: 20px; font-weight: bold; color: #97027e; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
        thead { background-color: #f3f4f6; }
        th { font-family: 'Times New Roman', Times, serif; padding: 11px; text-align: left; font-weight: bold; border: 1px solid #d1d5db; font-size: 13px; text-transform: uppercase; }
        td { font-family: 'Times New Roman', Times, serif; padding: 9px 11px; border: 1px solid #e5e7eb; }
        tbody tr:nth-child(even) { background-color: #f9fafb; }
        tbody tr:hover { background-color: #f3f4f6; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .number { font-family: 'Times New Roman', Times, serif; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .signature-box { text-align: center; width: 200px; }
        .signature-title { font-family: 'Times New Roman', Times, serif; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 60px; }
        .signature-name { font-family: 'Times New Roman', Times, serif; font-size: 13px; font-style: italic; }
        .page-break { page-break-after: always; }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="company-name">${data.cinemaInfo.tenRap}</div>
        <div class="company-info">${data.cinemaInfo.diaChi}</div>
        <div class="company-info">Điện thoại: ${data.cinemaInfo.soDienThoai} | Email: ${data.cinemaInfo.email}</div>
        
        <div class="report-title">BÁO CÁO DOANH THU</div>
        <div class="report-period">
          Từ ngày ${formatDate(start)} đến ngày ${formatDate(end)}
        </div>
      </div>

      <!-- Tổng quan -->
      <div class="section">
        <div class="section-title">I. TỔNG QUAN</div>
        
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Tổng doanh thu</div>
            <div class="summary-value">${data.totalRevenue.toLocaleString('vi-VN')} VNĐ</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tổng số hóa đơn</div>
            <div class="summary-value">${data.totalInvoices.toLocaleString('vi-VN')}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tổng số vé bán ra</div>
            <div class="summary-value">${data.totalTickets.toLocaleString('vi-VN')}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tổng đơn sản phẩm</div>
            <div class="summary-value">${data.totalProductOrders.toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </div>

      <!-- Phân tích theo hình thức -->
      <div class="section">
        <div class="section-title">II. PHÂN TÍCH THEO HÌNH THỨC ĐẶT VÉ</div>
        
        <table>
          <thead>
            <tr>
              <th>Hình thức</th>
              <th class="text-right">Doanh thu</th>
              <th class="text-right">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Đặt vé Online</td>
              <td class="text-right number">${data.onlineRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? ((data.onlineRevenue / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td>Đặt vé Offline</td>
              <td class="text-right number">${data.offlineRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? ((data.offlineRevenue / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td>TỔNG CỘNG</td>
              <td class="text-right number">${data.totalRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phân tích theo phương thức thanh toán -->
      <div class="section">
        <div class="section-title">III. PHÂN TÍCH THEO PHƯƠNG THỨC THANH TOÁN</div>
        
        <table>
          <thead>
            <tr>
              <th>Phương thức</th>
              <th class="text-right">Doanh thu</th>
              <th class="text-right">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>VNPAY</td>
              <td class="text-right number">${data.vnpayRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? ((data.vnpayRevenue / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td>Tiền mặt</td>
              <td class="text-right number">${data.cashRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? ((data.cashRevenue / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td>TỔNG CỘNG</td>
              <td class="text-right number">${data.totalRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Top phim -->
      <div class="section">
        <div class="section-title">IV. TOP 5 PHIM DOANH THU CAO NHẤT</div>
        
        <table>
          <thead>
            <tr>
              <th class="text-center">STT</th>
              <th>Tên phim</th>
              <th class="text-right">Số vé</th>
              <th class="text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            ${data.topMovies.length > 0 ? data.topMovies.map((movie, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${movie.tenPhim}</td>
                <td class="text-right number">${movie.soVe.toLocaleString('vi-VN')}</td>
                <td class="text-right number">${movie.doanhThu.toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Doanh thu theo ngày -->
      <div class="section">
        <div class="section-title">V. DOANH THU THEO NGÀY</div>
        
        <table>
          <thead>
            <tr>
              <th class="text-center">STT</th>
              <th>Ngày</th>
              <th class="text-right">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            ${data.dailyRevenue.length > 0 ? data.dailyRevenue.map((day, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${formatDate(new Date(day.ngay))}</td>
                <td class="text-right number">${day.doanhThu.toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="text-center">Không có dữ liệu</td></tr>'}
            ${data.dailyRevenue.length > 0 ? `
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td colspan="2" class="text-right">TỔNG CỘNG</td>
              <td class="text-right number">${data.totalRevenue.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <!-- Doanh thu bắp nước -->
      <div class="section">
        <div class="section-title">VI. DOANH THU THEO LOẠI</div>
        
        <table>
          <thead>
            <tr>
              <th>Loại</th>
              <th class="text-right">Doanh thu</th>
              <th class="text-right">Tỷ lệ/Tổng doanh thu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vé xem phim</td>
              <td class="text-right number">${data.totalTicketsRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? ((data.totalTicketsRevenue / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr>
              <td>Sản phẩm bắp nước</td>
              <td class="text-right number">${(data.comboRevenue + data.productRevenue).toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">${data.totalRevenue > 0 ? (((data.comboRevenue + data.productRevenue) / data.totalRevenue) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td>TỔNG CỘNG</td>
              <td class="text-right number">${data.totalRevenue.toLocaleString('vi-VN')} VNĐ</td>
              <td class="text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- Footer - Chữ ký -->
      <div class="footer">
        <div class="signature-box">
          <div class="signature-title">Người lập biểu</div>
          <div class="signature-name">(Ký, ghi rõ họ tên)</div>
        </div>
        
        <div class="signature-box">
          <div class="signature-title">Kế toán trưởng</div>
          <div class="signature-name">(Ký, ghi rõ họ tên)</div>
        </div>
        
        <div class="signature-box">
          <div class="signature-title">Giám đốc</div>
          <div class="signature-name">(Ký, đóng dấu, ghi rõ họ tên)</div>
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: right; font-size: 12px; color: #666; font-family: 'Times New Roman', Times, serif;">
        <i>Ngày xuất báo cáo doanh thu: ${formatDate(new Date())}</i>
      </div>
    </body>
    </html>
  `
}

export const generateRevenueReportPDF = async ( res: Response ) => {
  let browser
  try {
    const { start, end } = getDateRangeByType('month')

    // 1. Lấy dữ liệu thống kê
    const data = await getRevenueStatistics(start, end)

    // 2. Tạo HTML template
    const htmlContent = generateReportHTML(data, start, end)

    // 3. Tạo PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '15mm',
        bottom: '10mm',
        left: '15mm'
      }
    })

    await browser.close()

    // 4. Trả về file PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.send(pdfBuffer)

  } catch (error) {
    if (browser) await browser.close()
    console.error('Error generating revenue report PDF:', error)
    res.status(500).json({ message: 'Lỗi tạo báo cáo PDF' })
  }
}