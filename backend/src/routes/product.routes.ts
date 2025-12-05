import { Router } from 'express'
import productController from '@/controllers/product.controller'

const router = Router()

router.get('/categories-with-products', productController.getDanhMucVoiSanPhams)

export default router
