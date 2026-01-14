
import { Request, Response } from 'express'
import { prisma } from '@/lib/prisma'
import { TypeDate, getDateRangeByType } from '@/utils/dateRange'
import { revenueAnalysisAI } from '@/services/ai.service'

class ThongKeController {

  // [GET] /admin/dashboard/revenue
  async getRevenueStatistics(req: Request, res: Response) {
    try {
      const { typeDate } = req.query
      const filter: any = {}
      const { start, end } = getDateRangeByType(typeDate as TypeDate)

      filter.ngayThanhToan = {
        gte: start,
        lt: end,
      }
      const revenueData = await prisma.hOADON.aggregate({
        where: filter,
        _sum: {
          tongTien: true,
        },
      })

      res.status(200).json(Number(revenueData._sum.tongTien) || 0)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } 

  // [GET] /admin/dashboard/revenue/ticket
  async getTicketSalesStatistics(req: Request, res: Response) {
    try {
      const { typeDate } = req.query
      const filter: any = {}
      const { start, end } = getDateRangeByType(typeDate as TypeDate)

      filter.ngayThanhToan = {
        gte: start,
        lt: end,
      }

      const revenueData = await prisma.vE.count({
        where: {
          hoaDon: filter
        },
      })

      res.status(200).json(revenueData || 0)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } 

  // [GET] /admin/dashboard/revenue/product
  async getProductSalesStatistics(req: Request, res: Response) {
    try {
      const { typeDate } = req.query
      const filter: any = {}
      const { start, end } = getDateRangeByType(typeDate as TypeDate)
      filter.ngayThanhToan = {
        gte: start,
        lt: end,
      }

      const revenueComboData = await prisma.hOADON_COMBO.count({
        where: {
          hoaDon: filter
        },
      })

      const revenueFoodData = await prisma.hOADON_SANPHAM.count({
        where: {
          hoaDon: filter
        },
      })

      const totalRevenue = revenueComboData + revenueFoodData
      res.status(200).json(totalRevenue)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/new-users
  async getNewUsersStatistics(req: Request, res: Response) {
    try {
      const { typeDate } = req.query
      const filter: any = {}
      const { start, end } = getDateRangeByType(typeDate as TypeDate)

      filter.maLoaiNguoiDung = process.env.DEFAULT_USER_ROLE_KH
      filter.ngayTao = {
        gte: start,
        lt: end,
      }

      const newUsersCount = await prisma.nGUOIDUNG.count({
        where: filter,
      })

      res.status(200).json(newUsersCount)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/top-movies
  async getTopMoviesStatistics(req: Request, res: Response) {
    try {
      const { end } = getDateRangeByType('month')

      const movies = await prisma.pHIM.findMany({
        where: { 
          hienThi: true,
          ngayKhoiChieu: {
            lte: end,
          }
        },
        select: {
          maPhim: true,
          tenPhim: true,
          anhBia: true
        }
      })

      const moviesWithSales = await Promise.all(
        movies.map(async (movie) => {
          const countTicketSold = await prisma.vE.count({
            where: {
              gheSuatChieu: {
                suatChieu: {
                  maPhim: movie.maPhim
                }
              }
            }
          })
          
          return {
            ...movie,
            countTicketSold
          }
        })
      )

      const topMovies = moviesWithSales
        .sort((a, b) => b.countTicketSold - a.countTicketSold)
        .slice(0, 5)

      res.status(200).json(topMovies)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/payment
  async getPaymentMethodStatistics(req: Request, res: Response) {
    try {
      const { year } = req.query
      const filter: any = {}
      const { start, end } = getDateRangeByType("year", year ? new Date(Number(year), 0, 1) : new Date())

      filter.ngayThanhToan = {
        gte: start,
        lt: end,
      }

      const paymentMethods = await prisma.hOADON.groupBy({
        where: filter,
        by: ['phuongThucThanhToan'],
        _count: {
          phuongThucThanhToan: true,
        },
      })

      const formattedData = paymentMethods.map((method) => ({
        methodPayment: method.phuongThucThanhToan,
        count: method._count.phuongThucThanhToan,
      }))
      
      res.status(200).json(formattedData)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/revenue/time-series
  async getRevenueTimeSeriesStatistics(req: Request, res: Response) {
    try {
      const { start, end } = getDateRangeByType('day')
      const revenueData = await prisma.hOADON.findMany({
        where: {
          ngayThanhToan: {
            gte: start,
            lt: end,
          }
        },
        select: {
          tongTien: true,
          ngayThanhToan: true,
        }
      })
      
      // Initialize revenue by hour
      const revueneByHour: { [key: string]: number } = {}
      for (let hour = 0; hour < 24; hour++) {
        revueneByHour[hour] = 0
      }

      // Caculate revenue per hour
      revenueData.forEach((data) => {
        const hour = new Date(data.ngayThanhToan).getHours()
        revueneByHour[hour] += Number(data.tongTien)
      })

      // Format result
      const result = Object.keys(revueneByHour).map((hour) => ({
        hour: `${hour}:00`,
        revenue: revueneByHour[Number(hour)],
      }))

      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/revenue/type
  async getRevenueByTicketTypeStatistics(req: Request, res: Response) {
    try {
      const { year } = req.query
      const { start, end } = getDateRangeByType('year', year ? new Date(Number(year), 0, 1) : new Date())
      const revenueTicket = await prisma.vE.aggregate({
        where: {
          hoaDon: {
            ngayThanhToan: {
              gte: start,
              lt: end,
            }
          }
        },
        _sum: {
          giaVe: true,
        },
      })

      const revenueCombo = await prisma.hOADON_COMBO.aggregate({
        where: {
          hoaDon: {
            ngayThanhToan: {
              gte: start,
              lt: end,
            }
          }
        },
        _sum: {
          tongTien: true,
        },
      })

      const revenueProduct = await prisma.hOADON_SANPHAM.aggregate({
        where: {
          hoaDon: {
            ngayThanhToan: {
              gte: start,
              lt: end,
            }
          }
        },
        _sum: {
          tongTien: true,
        },
      })

      const revenueData = [
        {
          type: 'Ticket Sales',
          revenue: Number(revenueTicket._sum.giaVe) || 0,
        },
        {
          type: 'Product Sales',
          revenue: Number(revenueCombo._sum.tongTien) + Number(revenueProduct._sum.tongTien) || 0,
        },
      ]

      res.status(200).json(revenueData)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/years
  async getYearForSelection(req: Request, res: Response) {
    try {
      const invoices = await prisma.hOADON.findMany({
        select: {
          ngayThanhToan: true,
        },
        orderBy: { ngayThanhToan: 'asc' },
      })

      const yearsSet = new Set<number>()
      invoices.forEach((invoice) => {
        if (invoice.ngayThanhToan) {
          yearsSet.add(invoice.ngayThanhToan.getFullYear())
        }
      })
      const years = Array.from(yearsSet)

      res.status(200).json(years)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  // [GET] /admin/dashboard/ai-revenue-analysis
  async analyzeRevenueData(req: Request, res: Response) {
    try {
      const { typeDate } = req.query
      const answer = await revenueAnalysisAI(typeDate as TypeDate)

      res.status(200).json({ answer })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new ThongKeController()