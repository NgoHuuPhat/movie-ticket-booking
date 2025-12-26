import { Router } from 'express'
import usertypesController from '@/controllers/Admin/usertypes.controller'

const router = Router()

router.get('/', usertypesController.getAllUserTypes)

export default router