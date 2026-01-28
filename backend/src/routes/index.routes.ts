import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import moviesRouter from '@/routes/movies.routes'
import showtimesRouter from '@/routes/showtimes.routes'
import productsRouter from '@/routes/products.routes'
import combosRouter from '@/routes/combos.routes'
import paymentsRouter from '@/routes/payments.routes'
import discountsRouter from '@/routes/discounts.routes'
import seatsRouter from '@/routes/seats.routes'
import cinemaRouter from '@/routes/cinema.routes'
import newsRouter from '@/routes/news.routes'
import bannersRouter from '@/routes/banners.routes'
import chatbotRouter from '@/routes/chatbot.routes'
import profileRouter from '@/routes/profile.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movies', moviesRouter)
router.use('/news', newsRouter)
router.use('/banners', bannersRouter)
router.use('/payments', paymentsRouter)
router.use('/cinema', cinemaRouter)
router.use('/showtimes', authenticateToken, showtimesRouter)
router.use('/products', authenticateToken, productsRouter)
router.use('/combos', authenticateToken, combosRouter)
router.use('/discounts', authenticateToken, discountsRouter)
router.use('/seats', authenticateToken, seatsRouter)
router.use('/chatbot', chatbotRouter)
router.use('/profile', authenticateToken, profileRouter)

export default router