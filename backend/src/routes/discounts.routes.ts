import { Router } from 'express'
import discountsController from '@/controllers/discounts.controller'

const router = Router()

router.get('/', discountsController.getDiscountsForUser)
export default router
