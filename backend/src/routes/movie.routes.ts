import { Router } from 'express'
import movieController from '@/controllers/movie.controller'

const router = Router()

router.get('/', movieController.getAllPhim)
router.get('/showing', movieController.getPhimDangChieu)
router.get('/upcoming', movieController.getPhimSapChieu)
router.get('/:id/showtimes', movieController.getSuatChieuByPhimId)

router.get('/:slug', movieController.getPhimById)

export default router
