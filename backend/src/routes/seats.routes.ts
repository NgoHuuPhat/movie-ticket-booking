import { Router } from 'express'
import seatsController from '@/controllers/seats.controller'

const router = Router()

router.post('/hold', seatsController.holdSeats)
router.get('/hold/ttl', seatsController.getHoldTTL)

export default router

