import { Request, Response } from 'express'
import { generateRevenueReportPDF } from '@/services/report.service'

export class ReportController {
  // [GET] /admin/reports/export
  async downloadRevenueReport(req: Request, res: Response) {
    try {
      await generateRevenueReportPDF(res)
    } catch (error) {
      console.error('Error downloading revenue report:', error)
      res.status(500).json({ message: 'Lỗi tải báo cáo doanh thu' })
    }
  }

}

export default new ReportController()