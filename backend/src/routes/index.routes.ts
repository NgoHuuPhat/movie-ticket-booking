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
import ticketsRouter from '@/routes/tickets.routes'
import chatbotRouter from '@/routes/chatbot.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movies', authenticateToken, moviesRouter)
router.use('/showtimes', authenticateToken, showtimesRouter)
router.use('/products', authenticateToken, productsRouter)
router.use('/combos', authenticateToken, combosRouter)
router.use('/discounts', authenticateToken, discountsRouter)
router.use('/seats', authenticateToken, seatsRouter)
router.use('/cinema', authenticateToken, cinemaRouter)
router.use('/news', authenticateToken, newsRouter)
router.use('/banners', authenticateToken, bannersRouter)
router.use('/payments', paymentsRouter)
router.use('/tickets', authenticateToken, ticketsRouter)
router.use('/chatbot', authenticateToken, chatbotRouter)

export default router