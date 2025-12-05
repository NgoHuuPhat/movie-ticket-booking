import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import movieRouter from '@/routes/movie.routes'
import showtimeRouter from '@/routes/showtime.routes'
import productRouter from '@/routes/product.routes'
import comboRouter from '@/routes/combo.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movie', authenticateToken, movieRouter)
router.use('/showtime', authenticateToken, showtimeRouter)
router.use('/product', authenticateToken, productRouter)
router.use('/combo', authenticateToken, comboRouter)

export default router