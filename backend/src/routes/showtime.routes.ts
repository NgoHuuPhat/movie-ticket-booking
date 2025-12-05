import { Router } from 'express'
import showTimeController from '@/controllers/showtime.controller'

const router = Router()

router.get('/:id/seats', showTimeController.getGheTheoSuatChieuId)


export default router
