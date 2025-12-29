import { Router } from 'express'
import workschedulesController from '@/controllers/Admin/workschedules.controller'

const router = Router()

router.get('/', workschedulesController.getAllWorkSchedules)
router.post('/', workschedulesController.createWorkSchedule)
router.patch('/:maNhanVien/:maCaLam/:ngayLam', workschedulesController.updateWorkSchedule)
router.delete('/:maNhanVien/:maCaLam/:ngayLam', workschedulesController.deleteWorkSchedule)

export default router