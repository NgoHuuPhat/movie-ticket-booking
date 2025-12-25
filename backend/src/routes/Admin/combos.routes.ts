import { Router } from 'express'
import comboController from '@/controllers/Admin/combos.controller'
import upload from '@/middlewares/multer.middleware'
import { uploadToAWSS3 } from '@/middlewares/uploadToAWSS3.middleware'

const router = Router()

router.get('/', comboController.getAllCombo)
router.post('/', upload.single('anhCombo'), uploadToAWSS3, comboController.createCombo)
router.post('/bulk-action', comboController.bulkAction)
router.patch('/:id', upload.single('anhCombo'), uploadToAWSS3, comboController.updateCombo)
router.patch('/:id/show', comboController.toggleShowCombo)
router.delete('/:id', comboController.deleteCombo)

export default router
