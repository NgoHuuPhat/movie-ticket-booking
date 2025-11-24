import { Router } from 'express'
import phimController from '@/controllers/phim.controller'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.get('/', phimController.getAllPhim)


export default router