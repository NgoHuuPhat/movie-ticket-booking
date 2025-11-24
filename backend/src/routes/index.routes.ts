import { Router } from 'express'
import authRouter from '@/routes/auth.routes'
import phimRouter from '@/routes/phim.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/phim', phimRouter)

export default router