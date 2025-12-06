import { Router } from 'express'
import comboController from '@/controllers/combos.controller'

const router = Router()

router.get('/', comboController.getAllCombo)

export default router
