import { Router } from 'express'
import categoriesController from '@/controllers/Admin/categories.controller'

const router = Router()

router.get('/', categoriesController.getAllCategories)
router.post('/', categoriesController.createCategory)
router.patch('/:id', categoriesController.updateCategory)
router.delete('/:id', categoriesController.deleteCategory)

export default router