import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateUser } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { validateAdminRegistration } from '../middleware/validation';

const router = Router();

// Route to create initial admin (no auth required)
router.post('/setup', validateAdminRegistration, adminController.createInitialAdmin);

// Protected admin routes
router.post(
  '/users',
  authenticateUser,
  checkRole('admin'),
  validateAdminRegistration,
  adminController.createUser
);

export default router; 