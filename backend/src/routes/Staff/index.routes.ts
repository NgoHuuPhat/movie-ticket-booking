import { Router } from 'express'
import ticketsRouter from '@/routes/Staff/tickets.routes'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkStaff } from '@/middlewares/role.middleware'

const router = Router()
  
router.use('/tickets', authenticateToken, checkStaff, ticketsRouter)

export default router