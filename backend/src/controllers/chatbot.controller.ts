import { Request, Response } from 'express'
import { askQuestion } from '@/services/ai.service'

class ChatBotController {

  // [POST] /chatbot
  async handleMessage(req: Request, res: Response) {
    try {
      const { question } = req.body
      const answer = await askQuestion(question)
      
      res.status(200).json({answer})
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default new ChatBotController()