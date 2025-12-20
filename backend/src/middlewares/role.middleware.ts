import { Response, NextFunction } from "express"
import { IUserRequest } from "@/types/user"

enum Role {
  KH = 'KH',
  ADMIN = 'ADMIN'
}

export const checkAdmin = (req: IUserRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.maLoaiNguoiDung !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin Access Required' })
  }
  next()
}
