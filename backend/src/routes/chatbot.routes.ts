import { Router } from 'express'
import chatBotController from '@/controllers/chatbot.controller'

const router = Router()

router.post('/', chatBotController.handleMessage)

export default router