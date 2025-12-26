import express from 'express'
import router from '@/routes/index.routes'
import routerAdmin from '@/routes/Admin/index.routes'
import routerStaff from '@/routes/Staff/index.routes'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import '@/workers/email.worker'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api', router)
app.use('/api/admin', routerAdmin)
app.use('/api/staff', routerStaff)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
