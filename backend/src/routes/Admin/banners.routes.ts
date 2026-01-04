import { Router } from 'express'
import bannersController from '@/controllers/Admin/banners.controller'
import upload from '@/middlewares/multer.middleware'
import uploadToAWSS3 from '@/middlewares/uploadToAWSS3.middleware'

const router = Router()

router.get('/', bannersController.getAllBanners)
router.post('/', upload.single('anhBanner'), uploadToAWSS3, bannersController.createBanner)
router.post('/bulk-action', bannersController.bulkAction)
router.patch('/:id', upload.single('anhBanner'), uploadToAWSS3, bannersController.updateBanner)
router.patch('/:id/show', bannersController.toggleShowBanner)
router.delete('/:id', bannersController.deleteBanner)

export default router
