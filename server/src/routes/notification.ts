import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticateUser } from '../middleware/auth';
import { validateNotification, validateMessage } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Notification CRUD
router.post('/', authenticateUser, checkRole('admin'), validateNotification, notificationController.createNotification);
router.get('/', authenticateUser, notificationController.listNotifications);
router.put('/:id/read', authenticateUser, notificationController.markAsRead);

// Message management
router.post('/messages', authenticateUser, validateMessage, notificationController.sendMessage);
router.get('/messages', authenticateUser, notificationController.listMessages);

export default router; 