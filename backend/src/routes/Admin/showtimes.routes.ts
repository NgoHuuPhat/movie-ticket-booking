import { Router } from 'express'
import showTimesController from '@/controllers/Admin/showtimes.controller'

const router = Router()

router.get('/', showTimesController.getAllShowtimes)
router.get('/:id/seats', showTimesController.getShowtimeSeats)
router.get('/stats', showTimesController.getShowtimeStats)
router.post('/', showTimesController.createShowtime)
router.post('/bulk-action', showTimesController.bulkAction)
router.patch('/:id/activate', showTimesController.toggleShowtimeActivation)
router.patch('/:id', showTimesController.updateShowtime)
router.delete('/:id', showTimesController.deleteShowtime)

export default router
