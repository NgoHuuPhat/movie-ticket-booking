import { Router } from 'express'
import bannersController from '@/controllers/banners.controller'

const router = Router()

router.get('/', bannersController.getAllBanners)

export default router
