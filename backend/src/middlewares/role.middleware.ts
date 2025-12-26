import { Response, NextFunction } from "express"
import { IUserRequest } from "@/types/user"

enum Role {
  KH = 'KH',
  ADMIN = 'ADMIN',
  NV = 'NV'
}

export const checkAdmin = (req: IUserRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.maLoaiNguoiDung !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin Access Required' })
  }
  next()
}

export const checkStaff = (req: IUserRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.maLoaiNguoiDung !== Role.NV)) {
    return res.status(403).json({ message: 'Staff Access Required' })
  }
  next()
}

export const checkAdminOrStaff = (req: IUserRequest, res: Response, next: NextFunction) => {
  if (!req.user || !["ADMIN","NV"].includes(req.user.maLoaiNguoiDung)) {
    return res.status(403).json({ message: 'Access Denied' })
  }
  next()
}
