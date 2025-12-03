import { Router } from 'express'
import showTimeController from '@/controllers/showtime.controller'

const router = Router()

router.get('/:id/seats', showTimeController.getSeatsByShowTimeId)


export default router
