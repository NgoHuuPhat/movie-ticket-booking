import { Request } from 'express'
export interface IUserPayload {
  maNguoiDung: string
  maLoaiNguoiDung: string
}

export interface IUserRequest extends Request {
  user?: IUserPayload
}
