import { Router } from 'express'
import ticketsController from '@/controllers/Staff/tickets.controller'

const router = Router()

router.get('/', ticketsController.getInvoicesWithDetails)
router.post('/scan', ticketsController.scanTicket)

export default router
