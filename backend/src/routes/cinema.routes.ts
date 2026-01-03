import { Router } from 'express'
import cinemaController from '@/controllers/cinema.controller'

const router = Router()

router.get('/', cinemaController.getInfoCinema)

export default router