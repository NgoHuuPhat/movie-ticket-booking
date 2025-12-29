import { Router } from 'express'
import shiftsController from '@/controllers/Admin/shifts.controller'

const router = Router()

router.get('/', shiftsController.getAllShifts)
router.post('/', shiftsController.createShift)
router.patch('/:id', shiftsController.updateShift)
router.delete('/:id', shiftsController.deleteShift)


export default router