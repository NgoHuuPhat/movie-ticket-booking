import { Request, Response } from 'express'
import { redisClient } from '@/services/redis.service'
import { IUserRequest } from '@/types/user'
import { prisma } from '@/lib/prisma'

class GhesController {

  // [POST] /seats/hold
  async holdSeats(req: IUserRequest, res: Response) {
    try {
      const { showtimeId, seatIds } = req.body
      const maNguoiDung = req.user?.maNguoiDung
      const conflictSeats: string[] = []
      
      if(!maNguoiDung) {
        return res.status(401).json({ message: 'Chưa đăng nhập' })
      }

      for(const seatId of seatIds) {
        const result = await redisClient.set(`seathold:${showtimeId}:${seatId}`, maNguoiDung, 'EX', 300, 'NX')
        if(!result) {
          conflictSeats.push(seatId)
        }
      }

      if(conflictSeats.length > 0) {
        const conflictSeatDetails: string[] = []
        for(const seatId of seatIds) {
          const seat = await prisma.gHE.findUnique({
            where: {maGhe: seatId},
            select: { hangGhe: true, soGhe: true }
          })
          if (seat) {
            conflictSeatDetails.push(`${seat.hangGhe}${seat.soGhe}`)
          }
        }

        return res.status(409).json({ message: `Ghế ${conflictSeatDetails.join(', ')} đã được giữ bởi người dùng khác. Vui lòng chọn lại ghế.` })
      }

      return res.status(200).json({ message: 'Giữ ghế thành công' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /seats/hold/ttl
  async getHoldTTL(req: Request, res: Response) {
    try {
      const { showtimeId, seatId } = req.query
      if (!showtimeId || !seatId) {
        return res.status(400).json({ message: 'Thiếu showtimeId hoặc seatId' })
      }

      const ttl = await redisClient.ttl(`seathold:${showtimeId}:${seatId}`)
      if (ttl < 0) {
        return res.status(404).json({ message: 'Hết thời gian giữ ghế. Vui lòng chọn lại ghế.' })
      }

      return res.status(200).json({ ttl })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    } 
  }
}

export default new GhesController()