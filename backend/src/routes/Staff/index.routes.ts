import { Router } from 'express'
import ticketsRouter from '@/routes/Staff/tickets.routes'
import customersRouter from '@/routes/Staff/customers.routes'
import paymentsRouter from '@/routes/Staff/payments.routes'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkStaff } from '@/middlewares/role.middleware'

const router = Router()
  
router.use('/tickets', authenticateToken, checkStaff, ticketsRouter)
router.use('/customers', authenticateToken, checkStaff, customersRouter)
router.use('/payments',  paymentsRouter)

export default router