import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import moviesRouter from '@/routes/movies.routes'
import showtimesRouter from '@/routes/showtimes.routes'
import productsRouter from '@/routes/products.routes'
import combosRouter from '@/routes/combos.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movies', authenticateToken, moviesRouter)
router.use('/showtimes', authenticateToken, showtimesRouter)
router.use('/products', authenticateToken, productsRouter)
router.use('/combos', authenticateToken, combosRouter)

export default router