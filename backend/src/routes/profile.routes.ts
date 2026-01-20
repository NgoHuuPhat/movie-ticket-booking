import { Router } from 'express'
import profileController from '@/controllers/profile.controller'

const router = Router()

router.get('/', profileController.getProfile)
router.get('/history', profileController.getTransactionHistory)
router.patch('/password', profileController.updatePassword)

export default router