import { Router } from 'express'
import customersController from '@/controllers/Staff/customers.controller'

const router = Router()
router.get('/check-phone', customersController.checkCustomerExists)

export default router
