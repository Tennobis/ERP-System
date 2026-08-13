import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';
import { validateUserUpdate } from '../middleware/validation';

const router = Router();

router.post('/register', authController.register as any);
router.post('/login', authController.login as any);
router.post('/logout', authController.logout as any);
router.get('/profile', authenticateUser as any, authController.getProfile as any);
router.patch('/profile', authenticateUser as any, validateUserUpdate, authController.updateProfile as any);
router.post('/change-password', authenticateUser as any, authController.changePassword as any);

export default router; 