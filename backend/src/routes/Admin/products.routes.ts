import { Router } from 'express'
import productController from '@/controllers/Admin/products.controller'
import upload from '@/middlewares/multer.middleware'
import uploadToAWSS3 from '@/middlewares/uploadToAWSS3.middleware'

const router = Router()

router.get('/', productController.getAllProducts)
router.get('/select', productController.getProductsForSelect)
router.post('/', upload.single('anhSanPham'), uploadToAWSS3, productController.createProduct)
router.post('/bulk-action', productController.bulkAction)
router.patch('/:id', upload.single('anhSanPham'), uploadToAWSS3, productController.updateProduct)
router.patch('/:id/show', productController.toggleShowProduct)
router.delete('/:id', productController.deleteProduct)

export default router
