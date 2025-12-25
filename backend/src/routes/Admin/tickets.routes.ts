import { Router } from 'express'
import ticketsController from '@/controllers/Admin/tickets.controller'

const router = Router()

router.get('/', ticketsController.getInvoicesWithDetails)
router.get('/stats', ticketsController.getTicketStats)


export default router
