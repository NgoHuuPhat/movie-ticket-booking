import { Router } from 'express'
import newsController from '@/controllers/Admin/news.controller'
import upload from '@/middlewares/multer.middleware'
import uploadToAWSS3 from '@/middlewares/uploadToAWSS3.middleware'

const router = Router()

router.get('/', newsController.getAllNews)
router.post('/', upload.single('anhDaiDien'), uploadToAWSS3, newsController.createNews)
router.post('/bulk-action', newsController.bulkAction)
router.post('/send-mail', newsController.sendNewsEmail)
router.patch('/:id', upload.single('anhDaiDien'), uploadToAWSS3, newsController.updateNews)
router.patch('/:id/show', newsController.toggleShowNews)
router.delete('/:id', newsController.deleteNews)

export default router
