import { Request, Response } from 'express'
import { generateAccessToken, generateRefreshToken, verifyResetToken, generateResetToken, verifyRefreshToken} from '@/services/token.service'
import bcrypt from 'bcrypt'
import { generateIncrementalId } from '@/utils/generateId'
import validator from 'validator';
import { prisma } from '@/lib/prisma'
import { IUserRequest } from '@/types/user'
import { mailTemplate } from '@/services/mail.service'
import { redisClient } from '@/services/redis.service'
import { addEmailToQueue } from '@/queues/email.queue'

class AuthController {

  // [POST] /auth/register
  async register(req: Request, res: Response) {
    try {
      const { hoTen, email, matKhau, soDienThoai, maLoaiNguoiDung, ngaySinh, gioiTinh, anhDaiDien } = req.body

      const existingUser = await prisma.nGUOIDUNG.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' })
      }
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Email không hợp lệ' })
      }

      const existingPhone = await prisma.nGUOIDUNG.findUnique({ where: { soDienThoai } })
      if (existingPhone) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' })
      }
      if (!validator.isMobilePhone(soDienThoai, 'vi-VN')) {
        return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
      }

      if (matKhau.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      }
      const hashedPassword = await bcrypt.hash(matKhau, 10)

      const maNguoiDung = await generateIncrementalId(prisma.nGUOIDUNG, 'maNguoiDung', 'ND')
      await prisma.nGUOIDUNG.create({
        data: {
          maNguoiDung,
          hoTen,
          email,
          matKhau: hashedPassword,
          maLoaiNguoiDung,
          soDienThoai,
          ngaySinh: new Date(ngaySinh),
          gioiTinh,
          anhDaiDien,
        }
      })
      return res.status(201).json({ message: `Tạo tài khoản thành công` })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/login
  async login(req: Request, res: Response) {
    try {
      const { email, matKhau } = req.body
      const user = await prisma.nGUOIDUNG.findUnique({ where: { email }, include: { loaiNguoiDung: true } })  
      if (!user) {
        return res.status(401).json({ message: 'Email không tồn tại' })
      }
      const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau)
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Mật khẩu bạn nhập không đúng' })
      }
      const payload = { id: user.maNguoiDung, maLoaiNguoiDung: user.maLoaiNguoiDung }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)
      res.cookie('accessToken', accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      })
      res.cookie('refreshToken', refreshToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      return res.status(200).json({ message: `Đăng nhập thành công` })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/logout  
  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      return res.status(200).json({ message: 'Đăng xuất thành công' })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/refresh-token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token không tồn tại' })
      }
      const userData = verifyRefreshToken(refreshToken)
      if (!userData) {
        return res.status(403).json({ message: 'Refresh token không hợp lệ' })
      }
      const newAccessToken = generateAccessToken(userData)
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 
      })
      return res.status(200).json({ message: 'Refresh token thành công' })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /auth/me
  async getMe(req: IUserRequest, res: Response) {
    try {
      const user = await prisma.nGUOIDUNG.findUnique({ where: { maNguoiDung: req.user?.id }, include: { loaiNguoiDung: true } })
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' })
      }
      const { matKhau, ...userWithoutPassword } = user
      return res.status(200).json({ user: userWithoutPassword })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/forgot-password
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      const user = await prisma.nGUOIDUNG.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' })
      
      const otp = Math.floor(100000 + Math.random() * 900000)
      const result = await redisClient.set(`otp:${email}`, otp.toString(), 'EX', 180, 'NX')
      if(!result) {
        return res.status(400).json({ message: 'OTP đã tồn tại, vui lòng kiểm tra email của bạn' })
      }

      const html = mailTemplate(otp)
      const subject = 'Mã OTP đặt lại mật khẩu'
      await addEmailToQueue(email, subject, html)

      return res.status(200).json({ message: 'OTP đã được gửi đến email' })
    } catch (error) { 
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/verify-otp
  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body
      const storedOtp = await redisClient.get(`otp:${email}`)
            
      if (!storedOtp) return res.status(400).json({ message: 'OTP đã hết hạn' })
      if (storedOtp !== otp.toString()) return res.status(400).json({ message: 'OTP không hợp lệ' })
      await redisClient.del(`otp:${email}`)

      const forgotPasswordToken = generateResetToken(email)
      res.cookie('forgotPasswordToken', forgotPasswordToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
      })

      return res.status(200).json({ message: 'OTP đã được xác minh' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [POST] /auth/reset-password
  async resetPassword(req: Request, res: Response) {
    try {
      const forgotPasswordToken = req.cookies.forgotPasswordToken
      if (!forgotPasswordToken) {
        return res.status(401).json({message: 'Forgot password token không tồn tại. Vui lòng yêu cầu OTP mới.'})
      }

      let decoded: { email: string }
      try {
        decoded = verifyResetToken(forgotPasswordToken)
      } catch {
        return res.status(403).json({message: 'Forgot password token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu OTP mới.'})
      }

      const { email } = decoded
      const { matKhau, xacNhanMatKhau } = req.body

      if (!matKhau || !xacNhanMatKhau) {
        return res.status(400).json({message: 'Vui lòng cung cấp đầy đủ thông tin mật khẩu.'})
      }

      if( matKhau.length < 8) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      }

      if (matKhau !== xacNhanMatKhau) {
        return res.status(400).json({message: 'Mật khẩu và xác nhận mật khẩu không khớp'})
      }

      const user = await prisma.nGUOIDUNG.findUnique({ where: { email } })
      if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' })
      }

      const isSamePassword = await bcrypt.compare(matKhau, user.matKhau)
      if (isSamePassword) {
        return res.status(400).json({message: 'Mật khẩu mới phải khác mật khẩu cũ'})
      }

      const hashedPassword = await bcrypt.hash(matKhau, 10)
      await prisma.nGUOIDUNG.update({
        where: { email },
        data: { matKhau: hashedPassword }
      })

      res.clearCookie('forgotPasswordToken')
      return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

}

export default new AuthController()