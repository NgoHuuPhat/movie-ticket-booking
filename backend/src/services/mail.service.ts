import nodemailer from 'nodemailer'

const sendEmail = async (email: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  await transporter.sendMail({
    from: `"Lê Độ Cinema" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html,
  })
}

const mailTemplate = (otp: number) => {
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

export { sendEmail, mailTemplate }