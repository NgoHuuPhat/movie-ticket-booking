import jwt from 'jsonwebtoken'
import { IUserPayload } from '@/types/user'

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRE } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRE } as jwt.SignOptions)
}

export const generateResetToken = (email: string): string => {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRE } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as IUserPayload
}

export const verifyRefreshToken = (token: string): IUserPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as IUserPayload
}

export const verifyResetToken = (token: string): { email: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { email: string }
}