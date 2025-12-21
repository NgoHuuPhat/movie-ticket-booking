import { Router } from 'express'
import roomtypesController from '@/controllers/Admin/roomtypes.controller'

const router = Router()

router.get('/', roomtypesController.getAllRoomTypes)
router.post('/', roomtypesController.createRoomType)
router.patch('/:id', roomtypesController.updateRoomType)
router.delete('/:id', roomtypesController.deleteRoomType)

export default router