import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import moviesRouter from '@/routes/movies.routes'
import showtimesRouter from '@/routes/showtimes.routes'
import productsRouter from '@/routes/products.routes'
import combosRouter from '@/routes/combos.routes'
import paymentsRouter from '@/routes/payments.routes'
import discountsRouter from '@/routes/discounts.routes'
import seatsRouter from '@/routes/seats.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movies', authenticateToken, moviesRouter)
router.use('/showtimes', authenticateToken, showtimesRouter)
router.use('/products', authenticateToken, productsRouter)
router.use('/combos', authenticateToken, combosRouter)
router.use('/discounts', authenticateToken, discountsRouter)
router.use('/seats', authenticateToken, seatsRouter)
router.use('/payments', paymentsRouter)

export default router