import { Router } from 'express'
import paymentsController from '@/controllers/payments.controller'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.post('/vnpay-create', authenticateToken, paymentsController.createVNPay)
router.get('/vnpay-return', paymentsController.handleVNPayReturn)

export default router
