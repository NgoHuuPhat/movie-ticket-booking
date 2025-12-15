import { Router } from 'express'
import movieController from '@/controllers/movies.controller'

const router = Router()

router.get('/', movieController.getAllPhim)
router.get('/showing', movieController.getPhimDangChieu)
router.get('/upcoming', movieController.getPhimSapChieu)
router.get('/:id/showtimes', movieController.getSuatChieuByPhimId)

router.get('/:slug', movieController.getPhimBySlug)

export default router
