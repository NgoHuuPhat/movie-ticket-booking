import { Router } from 'express'
import reportController from '@/controllers/Admin/report.controller'

const router = Router()

router.get('/revenue', reportController.downloadRevenueReport)

export default router
