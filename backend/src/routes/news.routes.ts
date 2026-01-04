import { Router } from 'express'
import newsController from '@/controllers/news.controller'
import { ro } from 'date-fns/locale'

const router = Router()

router.get('/', newsController.getAllNews)
router.get('/:slug', newsController.getNewsBySlug)

export default router
