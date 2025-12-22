import { Router } from 'express'
import seatsController from '@/controllers/Admin/seats.controller'

const router = Router()

router.get('/types', seatsController.getAllCategories)
router.post('/types', seatsController.createCategory)
router.patch('/types/:id', seatsController.updateCategory)
router.delete('/types/:id', seatsController.deleteCategory)

router.get('/prices', seatsController.getAllPrices)
router.post('/prices', seatsController.createPrice)
router.patch('/prices/:maLoaiPhong/:maLoaiGhe', seatsController.updatePrice)

export default router