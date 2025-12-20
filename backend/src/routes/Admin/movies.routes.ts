import { Router } from 'express'
import moviesController from '@/controllers/Admin/movies.controller'
import upload from '@/middlewares/multer.middleware'
import uploadToAWSS3 from '@/middlewares/uploadToAWSS3.middleware'

const router = Router()

router.get('/', moviesController.getAllMovies)
router.get('/stats', moviesController.getMovieStats)
router.get('/:id', moviesController.getMovieById)
router.post('/', upload.single('anhBia'), uploadToAWSS3, moviesController.createMovie)
router.post('/bulk-action', moviesController.bulkAction)
router.patch('/:id', upload.single('anhBia'), uploadToAWSS3, moviesController.updateMovie)
router.patch('/:id/show', moviesController.toggleShowMovie)
router.delete('/:id', moviesController.deleteMovie)

export default router
