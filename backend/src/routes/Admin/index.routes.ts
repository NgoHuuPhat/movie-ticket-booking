import { Router } from 'express'
import moviesRouter from '@/routes/Admin/movies.routes'
import categoriesRouter from '@/routes/Admin/categories.routes'
import ageRatingsRouter from '@/routes/Admin/ageratings.routes'
import cinemaRouter from '@/routes/Admin/cinema.routes'
import roomtypesRouter from '@/routes/Admin/roomtypes.routes'
import seatsRouter from '@/routes/Admin/seats.routes'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkAdmin } from '@/middlewares/role.middleware'

const router = Router()

router.use('/movies', authenticateToken, checkAdmin, moviesRouter)
router.use('/categories', authenticateToken, checkAdmin, categoriesRouter)
router.use('/age-ratings', authenticateToken, checkAdmin, ageRatingsRouter)
router.use('/cinema', authenticateToken, checkAdmin, cinemaRouter)
router.use('/room-types', authenticateToken, checkAdmin, roomtypesRouter)
router.use('/seats', authenticateToken, checkAdmin, seatsRouter)

export default router