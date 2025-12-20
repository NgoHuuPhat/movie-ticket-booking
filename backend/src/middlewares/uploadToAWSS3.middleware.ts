import { uploadToS3 } from '@/services/s3.service'
import { NextFunction, Request, Response } from 'express'

export async function uploadToAWSS3(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next()
  }
  try {
    const result = await uploadToS3(req.file.buffer, req.file.fieldname, req.file.originalname, req.file.mimetype)
    req.body.imageUrl = result
    next()
  } catch (err) {
    return res.status(500).json({ error: err })
  }
}

export default uploadToAWSS3