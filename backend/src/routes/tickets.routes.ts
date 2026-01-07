import { Router } from 'express'
import ticketsController from '@/controllers/tickets.controller'

const router = Router()

router.get('/history', ticketsController.getInvoicesWithDetails)

export default router
