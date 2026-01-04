import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'

class TinTucsController {

  // [GET] /news
  async getAllNews(req: Request, res: Response) {
    try {
      const news = await prisma.tINTUC.findMany({ 
        where: { hienThi: true },
        orderBy: { ngayDang: 'desc' }
      })
      return res.status(200).json(news)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /news/:slug
  async getNewsBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params
      const newsItem = await prisma.tINTUC.findUnique({ 
        where: { slug }
      })
      if (!newsItem) {
        return res.status(404).json({ message: 'Tin tức không tồn tại' })
      }
      return res.status(200).json(newsItem)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}
export default new TinTucsController()