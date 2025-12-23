import { Router } from 'express'
import showTimeController from '@/controllers/Admin/showtimes.controller'

const router = Router()

router.get('/', showTimeController.getAllShowtimes)
router.get('/stats', showTimeController.getShowtimeStats)
router.post('/', showTimeController.createShowtime)
router.post('/bulk-action', showTimeController.bulkAction)
router.patch('/:id/activate', showTimeController.toggleShowtimeActivation)
router.patch('/:id', showTimeController.updateShowtime)
router.delete('/:id', showTimeController.deleteShowtime)

export default router
