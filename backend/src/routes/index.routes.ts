import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import movieRouter from '@/routes/movie.routes'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.use('/auth', authRouter)
router.use('/movie', authenticateToken, movieRouter)

export default router