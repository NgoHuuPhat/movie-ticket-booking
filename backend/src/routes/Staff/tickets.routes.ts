import { Router } from 'express'
import ticketsController from '@/controllers/Staff/tickets.controller'

const router = Router()

router.get('/', ticketsController.getInvoicesWithDetails)
router.post('/scan-ticket', ticketsController.scanTicket)
router.post('/scan-food', ticketsController.scanFood)

export default router
