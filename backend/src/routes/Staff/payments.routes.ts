import { Router } from 'express'
import paymentsController from '@/controllers/Staff/payments.controller'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkStaff } from '@/middlewares/role.middleware'

const router = Router()

router.post('/vnpay-create', authenticateToken, checkStaff, paymentsController.createVNPay)
router.get('/vnpay-return', paymentsController.handleVNPayReturn)

router.post('/cash', authenticateToken, checkStaff, paymentsController.handleCashPayment)
router.get('/ticket/:maHoaDon', authenticateToken, checkStaff, paymentsController.downloadTicket)

export default router
