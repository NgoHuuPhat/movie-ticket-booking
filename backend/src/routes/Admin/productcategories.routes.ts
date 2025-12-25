
import { Router } from 'express'
import productCategoriesController from '@/controllers/Admin/productcategories.controller'

const router = Router()

router.get('/', productCategoriesController.getAllProductCategories)
router.post('/', productCategoriesController.createProductCategory)
router.patch('/:id', productCategoriesController.updateProductCategory)
router.delete('/:id', productCategoriesController.deleteProductCategory)

export default router
