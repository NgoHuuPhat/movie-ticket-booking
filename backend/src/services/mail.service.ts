import { ITicketData } from '@/types/payment'
import nodemailer from 'nodemailer'

const sendEmail = async (email: string, subject: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Lê Độ Cinema" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: mailTemplate(otp),
  })
}

const sendTicketEmail = async (email: string, subject: string, ticketData: ITicketData, qrBuffer: Buffer) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Lê Độ Cinema" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: ticketTemplate(ticketData),
    attachments: [{
      filename: 'qrcode.png',
      content: qrBuffer,
      cid: 'qrcode@ledocinema' 
    }]
  })
}

const sendNewsEmail = async (email: string, title: string, content: string, imageUrl: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Lê Độ Cinema" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: title,
    html: newsTemplate(content, imageUrl),
  })
}

const newsTemplate = (content: string, imageUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:20px 10px;">
      <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:4px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:30px 20px;">
        
        <!-- IMAGE -->
        <img src="${imageUrl}" alt="Cinema Promo"
          style="width:100%; height:auto; display:block; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.1);"
        />

        <!-- CONTENT -->
        <div style="color:#555; font-size:15px; line-height:1.8; margin:25px 0;">
          ${content}
        </div>

        <!-- CTA -->
        <div style="text-align:center; margin:30px 0;">
          <a href="${process.env.CLIENT_URL}/movies/showing" target="_blank"
            style="display:inline-block; background:#a320c1; color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold; padding:12px 50px; border-radius:4px;">
            Đặt vé ngay
          </a>
        </div>

        <hr style="border:0; border-top:1px solid #e5e5e5; margin:25px 0;" />

        <!-- FOOTER -->
        <div style="text-align:center;">
          <p style="color:#777; font-size:13px; margin:5px 0;">
            📍 46 Trần Phú, Hải Châu, Đà Nẵng, Việt Nam
          </p>
          <p style="color:#777; font-size:13px; margin:5px 0;">
            ☎️ 0236 3822574 | 📧 ttphpcbdn@gmail.com
          </p>
        </div>

      </div>
    </div>
  `
}


const mailTemplate = (otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; background: #f5f6fa; padding: 20px;">
      <div style="
        max-width: 480px;
        margin: auto;
        background: #ffffff;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border: 1px solid #eee;
      ">
        <h2 style="
          color: #2c3e50;
          text-align: center;
          margin-bottom: 20px;
          font-weight: 600;
        ">
          🔐 Xác thực đặt lại mật khẩu
        </h2>

        <p style="color: #555; font-size: 15px; text-align: center;">
          Mã OTP của bạn để đặt lại mật khẩu là:
        </p>

        <div style="
          text-align: center;
          margin: 25px 0;
          padding: 15px 0;
          border-radius: 8px;
          background: #eaf2ff;
          border: 1px dashed #3b82f6;
        ">
          <span style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #2563eb;
          ">
            ${otp}
          </span>
        </div>

        <p style="color: #666; font-size: 14px;">
          Mã OTP này có hiệu lực trong <strong>3 phút</strong>.  
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>

        <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e5e5e5;" />

        <p style="color: #444; font-size: 14px; text-align: center; margin-top: 10px;">
          Trân trọng,<br/>
          <strong>Lê Độ Cinema</strong>
        </p>
      </div>
    </div>
  `
}

const ticketTemplate = (data: ITicketData) => {
  return `
  <body style="margin:0; padding:20px; background:#f8f8f8; font-family:Arial,sans-serif; font-size:14px; line-height:1.5; color:#000;">
    <div style="max-width:500px; margin:0 auto; background:#fff; padding:20px; border-radius:8px;">
      
      <h1 style="margin:0 0 10px 0; text-align:center; font-weight:bold;">
        ${data.tenPhim}
      </h1>
      
      <p style="margin:0 0 5px 0; font-size:16px; font-weight:bold; color:#5492d9; text-align:center;">
        Lê Độ Cinema
      </p>
      
      <p style="margin:0 0 20px 0; text-align:center; color:#555;">
        46 Trần Phú, Hải Châu, Đà Nẵng, Việt Nam
      </p>
      
      <hr style="border:none; border-top:2px dotted #ccc; margin:20px 0;">

      <p style="margin:5px 0; text-align:center; font-size:14px; color:#555;">
        MÃ VÉ (RESERVATION CODE)
      </p>
      <p style="margin:0; text-align:center; font-size:28px; font-weight:bold;">
        ${data.maQR}
      </p>
      
      <div style="text-align:center;">
        <img src="cid:qrcode@ledocinema" alt="QR Code" style="width:180px; height:180px; display:inline-block;">
      </div>
      
      <p style="margin:5px 0; text-align:center; font-size:14px; color:#555;">
        SUẤT CHIẾU (SESSION)
      </p>
      <p style="margin:10px 0 20px 0; text-align:center; font-size:22px; font-weight:bold;">
        ${data.ngayChieu} ${data.gioChieu}
      </p>
      
      <hr style="border:none; border-top:2px dotted #ccc; margin:20px 0;">
      
      <p style="background:#f5f7f9; padding:20px; font-size:13px; border-radius:4px; margin:20px 0;">
        Quý khách vui lòng xuất trình mã vé điện tử này tại cổng để được quét vào rạp.
      </p>
      
      <table style="width:100%; border-collapse:collapse; margin:20px 0;">
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Phòng chiếu</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${data.phongChieu}</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Ghế</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${data.ghe.join(', ')}</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Thời gian thanh toán</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${data.thoiGianThanhToan}</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Tiền combo bắp nước</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${(data.tienComboBapNuoc || 0).toLocaleString()} VNĐ</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Tổng tiền</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${data.tongTien.toLocaleString()} VNĐ</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Số tiền giảm giá</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${(data.soTienGiamGia || 0).toLocaleString()} VNĐ</td>
        </tr>
        <tr style="border-bottom:1px dotted #ccc;">
          <td style="padding:8px 0; color:#555;">Số tiền thanh toán</td>
          <td style="padding:8px 0; font-weight:bold; text-align:right;">${data.soTienThanhToan.toLocaleString()} VNĐ</td>
        </tr>
      </table>
      
      <hr style="border:none; border-top:2px dotted #ccc; margin:20px 0;">
      
      <p style="font-size:12px; text-align:center; color:#555; margin:20px 0;">
        <strong>Lưu ý / Note:</strong><br>
        Lưu ý / Note:
        Vé đã mua không thể hủy, đổi hoặc trả lại. Vui lòng liên hệ Ban Quản Lý rạp hoặc tra cứu thông tin 
        tại mục Điều khoản mua và sử dụng vé xem phim để biết thêm chi tiết. Cảm ơn bạn đã lựa chọn mua vé tại Ledocinema. Chúc bạn xem phim vui vẻ!
      </p>
      
      <div style="text-align:center; margin:20px 0;">
        <a href="tel:02363822574" style="text-decoration:none; font-size:14px; font-weight:bold; color:#000; margin:0 10px;">
          ☎️ 02363822574
        </a>
        <a href="mailto:ttphpcbdn@gmail.com" style="text-decoration:none; font-size:14px; font-weight:bold; color:#000; margin:0 10px;">
          📧 ttphpcbdn@gmail.com
        </a>
      </div>
      
      <hr style="border:none; border-top:2px dotted #ccc; margin:20px 0;">
      
      <p style="text-align:center; font-size:12px; color:#777; margin:20px 0;">
        Trân trọng cảm ơn Quý khách đã tin tưởng sử dụng dịch vụ!
      </p>
      
    </div>
  </body>
  `
}

export { sendEmail, sendTicketEmail, sendNewsEmail }