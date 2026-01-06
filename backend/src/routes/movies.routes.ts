import { Router } from 'express'
import movieController from '@/controllers/movies.controller'

const router = Router()

router.get('/showing', movieController.getPhimDangChieu)
router.get('/upcoming', movieController.getPhimSapChieu)
router.get('/', movieController.searchPhim)
router.get('/:id/showtimes', movieController.getSuatChieuByPhimId)

router.get('/:slug', movieController.getPhimBySlug)

export default router
