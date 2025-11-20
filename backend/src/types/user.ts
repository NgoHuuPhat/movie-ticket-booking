import { Request } from 'express'
export interface IUserPayload {
  id: string
  maLoaiNguoiDung: string
}

export interface IUserRequest extends Request {
  user?: IUserPayload
}
