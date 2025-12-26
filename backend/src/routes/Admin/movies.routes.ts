import { Router } from 'express'
import moviesController from '@/controllers/Admin/movies.controller'
import upload from '@/middlewares/multer.middleware'
import uploadToAWSS3 from '@/middlewares/uploadToAWSS3.middleware'
import { checkAdmin, checkAdminOrStaff } from '@/middlewares/role.middleware'

const router = Router()

router.get('/', checkAdmin, moviesController.getAllMovies)
router.get('/select', checkAdminOrStaff, moviesController.getMoviesForSelect)
router.get('/stats', checkAdmin, moviesController.getMovieStats)
router.get('/:id', checkAdmin, moviesController.getMovieById)
router.post('/', checkAdmin, upload.single('anhBia'), uploadToAWSS3, moviesController.createMovie)
router.post('/bulk-action', checkAdmin, moviesController.bulkAction)
router.patch('/:id', checkAdmin, upload.single('anhBia'), uploadToAWSS3, moviesController.updateMovie)
router.patch('/:id/show', checkAdmin, moviesController.toggleShowMovie)
router.delete('/:id', checkAdmin, moviesController.deleteMovie)
export default router
