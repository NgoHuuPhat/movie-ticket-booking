import { Router } from 'express'
import discountsController from '@/controllers/discounts.controller'

const router = Router()

router.post('/check', discountsController.checkDiscountCode)

export default router
