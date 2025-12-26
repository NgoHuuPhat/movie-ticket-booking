import { Router } from 'express'
import usersController from '@/controllers/Admin/users.controller'

const router = Router()

router.get('/', usersController.getAllUsers)
router.get('/stats', usersController.getUserStats)
router.post('/', usersController.createUser)
router.post('/bulk-action', usersController.bulkAction)
router.patch('/:id/status', usersController.toggleUserStatus)
router.delete('/:id', usersController.deleteUser)

export default router