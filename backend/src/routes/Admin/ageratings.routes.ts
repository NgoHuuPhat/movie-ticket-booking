import { Router } from 'express'
import ageRatingsController from '@/controllers/Admin/ageratings.controller'

const router = Router()

router.get('/', ageRatingsController.getAllAgeRatings)
router.post('/', ageRatingsController.createAgeRating)
router.patch('/:id', ageRatingsController.updateAgeRating)
router.delete('/:id', ageRatingsController.deleteAgeRating)

export default router
