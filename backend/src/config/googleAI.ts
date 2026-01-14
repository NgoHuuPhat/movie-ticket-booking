import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_AI_MODEL) {
  throw new Error('Google AI configuration is missing in environment variables.')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_AI_MODEL})

export { model }
