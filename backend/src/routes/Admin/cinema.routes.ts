import { Router } from 'express'
import cinemaController from '@/controllers/Admin/cinema.controller'

const router = Router()

router.get('/', cinemaController.getInfoCinema)
router.patch('/', cinemaController.updateCinemaInfo)

router.get('/rooms', cinemaController.getAllRooms)
router.get('/rooms/select', cinemaController.getRoomsForSelect)
router.post('/rooms', cinemaController.createRoom)
router.post('/bulk-action', cinemaController.bulkAction)
router.patch('/:id/activate', cinemaController.toggleCinemaActivation)
router.patch('/rooms/:id', cinemaController.updateRoom)
router.delete('/rooms/:id', cinemaController.deleteRoom)

router.get('/rooms/:id/seats', cinemaController.getRoomSeats)
router.patch('/rooms/:id/seats', cinemaController.updateRoomSeats)

export default router