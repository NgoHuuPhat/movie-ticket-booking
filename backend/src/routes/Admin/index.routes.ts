import { Router } from 'express'
import moviesRouter from '@/routes/Admin/movies.routes'
import categoriesRouter from '@/routes/Admin/categories.routes'
import ageRatingsRouter from '@/routes/Admin/ageratings.routes'
import cinemaRouter from '@/routes/Admin/cinema.routes'
import roomtypesRouter from '@/routes/Admin/roomtypes.routes'
import seatsRouter from '@/routes/Admin/seats.routes'
import showtimesRouter from '@/routes/Admin/showtimes.routes'
import ticketsRouter from '@/routes/Admin/tickets.routes'
import productsRouter from '@/routes/Admin/products.routes'
import combosRouter from '@/routes/Admin/combos.routes'
import usertypesRouter from '@/routes/Admin/usertypes.routes'
import usersRouter from '@/routes/Admin/users.routes'
import productCategoriesRouter from '@/routes/Admin/productcategories.routes'
import shiftsRouter from '@/routes/Admin/shifts.routes'
import workschedulesRouter from '@/routes/Admin/workschedules.routes'
import authenticateToken from '@/middlewares/auth.middleware'
import { checkAdmin } from '@/middlewares/role.middleware'

const router = Router()

router.use('/movies', authenticateToken, moviesRouter)
router.use('/tickets', authenticateToken, checkAdmin, ticketsRouter)
router.use('/categories', authenticateToken, checkAdmin, categoriesRouter)
router.use('/age-ratings', authenticateToken, checkAdmin, ageRatingsRouter)
router.use('/cinema', authenticateToken, checkAdmin, cinemaRouter)
router.use('/room-types', authenticateToken, checkAdmin, roomtypesRouter)
router.use('/seats', authenticateToken, checkAdmin, seatsRouter)
router.use('/showtimes', authenticateToken, checkAdmin, showtimesRouter)
router.use('/product-categories', authenticateToken, checkAdmin, productCategoriesRouter)
router.use('/products', authenticateToken, checkAdmin, productsRouter)
router.use('/combos', authenticateToken, checkAdmin, combosRouter)
router.use('/usertypes', authenticateToken, checkAdmin, usertypesRouter)
router.use('/users', authenticateToken, checkAdmin, usersRouter)
router.use('/shifts', authenticateToken, checkAdmin, shiftsRouter)
router.use('/workschedules', authenticateToken, checkAdmin, workschedulesRouter)

export default router