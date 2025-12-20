import { Router } from 'express'
import moviesRouter from '@/routes/Admin/movies.routes'
import categoriesRouter from '@/routes/Admin/categories.routes'
import ageRatingsRouter from '@/routes/Admin/ageratings.routes'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkAdmin } from '@/middlewares/role.middleware'

const router = Router()

router.use('/movies', authenticateToken, checkAdmin, moviesRouter)
router.use('/categories', authenticateToken, checkAdmin, categoriesRouter)
router.use('/age-ratings', authenticateToken, checkAdmin, ageRatingsRouter)

export default router