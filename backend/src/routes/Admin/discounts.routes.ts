import { Router } from 'express'
import discountsController from '@/controllers/Admin/discounts.controller'

const router = Router()

router.get('/', discountsController.getAllDiscounts)
router.get('/stats', discountsController.getDiscountStats)
router.post('/', discountsController.createDiscount)
router.post('/bulk-action', discountsController.bulkAction)
router.patch('/:id', discountsController.updateDiscount)
router.patch('/:id/toggle', discountsController.toggleDiscount)
router.delete('/:id', discountsController.deleteDiscount)

export default router
