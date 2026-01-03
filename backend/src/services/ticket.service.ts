import { Response } from 'express'
import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'

export const generateTicketPDF = async (maHoaDon: string, res: Response) => {
  let browser
  try {
    const hoaDon = await prisma.hOADON.findUnique({
      where: { maHoaDon },
      include: {
        ves: {
          include: {
            gheSuatChieu: {
              include: {
                ghe: { include: { loaiGhe: true } },
                suatChieu: { include: { phim: { include: { phanLoaiDoTuoi: true } }, phongChieu: true } }
              }
            }
          }
        },
        hoaDonCombos: { include: { combo: true } },
        hoaDonSanPhams: { include: { sanPham: true } },
        nguoiDung: true
      }
    })

    if (!hoaDon) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' })
    }

    const suatChieu = hoaDon.ves[0]?.gheSuatChieu.suatChieu
    const phim = suatChieu?.phim
    const phongChieu = suatChieu?.phongChieu

    // Tạo danh sách vé đơn giản - mỗi ghế một vé riêng (không còn ghép đôi)
    const tickets = hoaDon.ves.map(ve => {
      const ghe = ve.gheSuatChieu.ghe
      const seatName = `${ghe.hangGhe}${ghe.soGhe}`
      const seatType = ve.gheSuatChieu.ghe.loaiGhe?.tenLoaiGhe || 'Standard'
      const price = Number(ve.giaVe)

      return {
        seatDisplay: seatName,
        price,
        maVe: ve.maVe,
      }
    })

    // Generate QR codes cho từng vé riêng lẻ
    const ticketQRs = await Promise.all(
      tickets.map(async ticket => {
        const qrString = `${hoaDon.maQR}-${ticket.maVe}`

        return {
          seatDisplay: ticket.seatDisplay,
          price: ticket.price,
          QRCode: qrString,
          linkQRCode: await QRCode.toDataURL(qrString),
        }
      })
    )

    // Bắp nước
    const foodItems = [
      ...hoaDon.hoaDonCombos.map(item => ({
        name: item.combo.tenCombo,
        quantity: item.soLuong,
        price: Number(item.donGia) * item.soLuong
      })),
      ...hoaDon.hoaDonSanPhams.map(item => ({
        name: item.sanPham.tenSanPham,
        quantity: item.soLuong,
        price: Number(item.donGia) * item.soLuong
      }))
    ]

    const totalFoodPrice = foodItems.reduce((sum, item) => sum + item.price, 0)
    const hasFood = foodItems.length > 0

    let foodQR = ''
    let foodTicketHTML = ''

    if (hasFood) {
      foodQR = await QRCode.toDataURL(hoaDon.maQR)
      foodTicketHTML = `
        <div class="ticket">
          <div class="ticket-header">
            <div class="cinema-name">Rạp chiếu phim Lê Độ</div>
            <div class="cinema-address">46 Trần Phú, Hải Châu, Đà Nẵng</div>
            <div class="cinema-subtitle">VÉ BẮP NƯỚC (FOODS)</div>
          </div>

          <div class="info-row">
            <span class="info-label">Phim</span>
            <span class="info-value">${phim?.tenPhim || '—'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Suất chiếu</span>
            <span class="info-value">
              ${new Date(suatChieu.gioBatDau).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} 
              - ${new Date(suatChieu.gioBatDau).toLocaleDateString('vi-VN')}
            </span>
          </div>

          ${foodItems.map(item => `
            <div class="info-row">
              <span class="info-label">${item.name}</span>
              <span class="info-value">x${item.quantity}</span>
            </div>
          `).join('')}

          <div class="info-row">
            <span class="info-label">Tổng tiền</span>
            <span class="info-value">${totalFoodPrice.toLocaleString()} VNĐ</span>
          </div>

          <div class="qr-section">
            <div class="qr-label">QUÉT TẠI QUẦY BẮP NƯỚC</div>
            <img src="${foodQR}" alt="QR Food" class="qr-code" />
            <p class="qr-id">Mã vé: ${hoaDon.maQR}</p>
            <div class="qr-instruction">Vé đã mua không đổi trả, không hoàn tiền</div>
          </div>
        </div>
      `
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,Helvetica,sans-serif;background:#ffffff;font-size:15px;color:#111827}
          
          .ticket{width:100%;margin:0;background:white;padding:38px 70px;page-break-inside:avoid;page-break-after:always}
          .ticket:last-child{page-break-after:avoid}
          .ticket-header{text-align:center;padding-bottom:32px;margin-bottom:20px;border-bottom:1px solid #e5e7eb}
          .cinema-name{font-size:18px;font-weight:bold;color:#374151;margin-bottom:3px;letter-spacing:1px}
          .cinema-address{font-size:12px;color:#6b7280;margin-bottom:10px}
          .cinema-subtitle{color:#97027eff;font-size:26px;font-weight:bold;margin-top:12px;margin-bottom:4px;letter-spacing:0.5px}
          .movie-title{font-size:22px;font-weight:bold;color:#111827;line-height:1.2;margin-bottom:6px}
          
          .info-row{display:flex;justify-content:space-between;padding:12px 0;font-size:15px}
          .info-label{color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;font-size:13px}
          .info-value{font-weight:700;text-align:right;color:#111827}
          
          .qr-section{text-align:center; padding-top:42px; margin-top:32px; border-top:1px solid #e5e7eb}
          .qr-label{font-size:16px;color:#374151;font-weight:600;}
          .qr-code{width:150px;height:150px;}
          .qr-id{font-size:16px;color:#9ca3af;margin-bottom:8px;font-weight:bold}
          .qr-instruction{font-size:16px;color:#9ca3af; font-style: italic;}
          @media print{body{margin:0;background:white}.ticket{margin:0;box-shadow:none}}
        </style>
      </head>
      <body>
        ${ticketQRs.map(ticket => `
          <div class="ticket">
            <div class="ticket-header">
              <div class="cinema-name">Rạp chiếu phim Lê Độ</div>
              <div class="cinema-address">46 Trần Phú, Hải Châu, Đà Nẵng</div>
              <div class="cinema-subtitle">VÉ XEM PHIM (TICKET)</div>
              <div class="movie-title">${phim?.tenPhim || '—'} (${phim.phanLoaiDoTuoi?.tenPhanLoaiDoTuoi || '—'})</div>
            </div>

            <div class="info-row">
              <span class="info-label">Phòng chiếu</span>
              <span class="info-value">${phongChieu?.tenPhong || '—'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ngày chiếu</span>
              <span class="info-value">${new Date(suatChieu.gioBatDau).toLocaleDateString('vi-VN', {
                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
              })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Giờ chiếu</span>
              <span class="info-value">${new Date(suatChieu.gioBatDau).toLocaleTimeString('vi-VN', {
                hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ghế ngồi</span>
              <span class="info-value">${ticket.seatDisplay}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Giá vé</span>
              <span class="info-value">${ticket.price.toLocaleString()} VNĐ</span>
            </div>

            <div class="qr-section">
              <div class="qr-label">QUÉT TẠI CỔNG VÀO</div>
              <img src="${ticket.linkQRCode}" alt="QR Code" class="qr-code" />
              <p class="qr-id">Mã vé: ${ticket.QRCode}</p>
              <div class="qr-instruction">Vé đã mua không đổi trả, không hoàn tiền</div>
            </div>
          </div>
        `).join('')}

        ${foodTicketHTML}
      </body>
      </html>`

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A5',
      printBackground: true,
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ticket_${maHoaDon}.pdf"`)
    res.send(pdfBuffer)

  } catch (error) {
    if (browser) await browser.close()
    console.error('Error generating ticket PDF:', error)
    res.status(500).json({ message: 'Lỗi tạo vé PDF' })
  }
}