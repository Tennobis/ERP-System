import { Router } from 'express';
import { storeStaffController } from '../controllers/storeStaffController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// StoreStaff CRUD routes
router.post('/store-staff', authenticateUser, storeStaffController.createStoreStaff);
router.get('/store-staff/:userId', authenticateUser, storeStaffController.listStoreStaff);
router.get('/store-staff', authenticateUser, storeStaffController.getAllStoreStaff);
router.get('/store-staff/:id', authenticateUser, storeStaffController.getStoreStaff);
router.put('/store-staff/:id', authenticateUser, storeStaffController.updateStoreStaff);
router.put('/store-staff/:id/activity-status', authenticateUser, storeStaffController.updateStaffActivityStatus);
router.delete('/store-staff/:id', authenticateUser, storeStaffController.deleteStoreStaff);

export default router;
