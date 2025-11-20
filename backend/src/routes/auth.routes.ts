import { Router } from 'express'
import authController from '@/controllers/auth.controller'
import authenticateToken from '@/middlewares/auth.middleware'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/refresh-token', authController.refreshToken)
router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-otp', authController.verifyOTP)
router.post('/reset-password', authController.resetPassword)
router.get('/me', authenticateToken, authController.getMe)

export default router