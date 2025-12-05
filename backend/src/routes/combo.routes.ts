import { Router } from 'express'
import comboController from '@/controllers/combo.controller'

const router = Router()

router.get('/', comboController.getAllCombo)

export default router
