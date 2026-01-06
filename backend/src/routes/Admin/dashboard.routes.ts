import { Router } from 'express'
import dashboardController from '@/controllers/Admin/dashboard.controller'

const router = Router()

router.get('/years', dashboardController.getYearForSelection)

router.get('/revenue', dashboardController.getRevenueStatistics)
router.get('/revenue/ticket', dashboardController.getTicketSalesStatistics)
router.get('/revenue/product', dashboardController.getProductSalesStatistics)
router.get('/new-users', dashboardController.getNewUsersStatistics)

router.get('/revenue/time-series', dashboardController.getRevenueTimeSeriesStatistics)
router.get('/revenue/type', dashboardController.getRevenueByTicketTypeStatistics)
router.get('/top-movies', dashboardController.getTopMoviesStatistics)
router.get('/payment', dashboardController.getPaymentMethodStatistics)

export default router
