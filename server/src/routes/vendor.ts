import { Router } from 'express';
import { vendorController } from '../controllers/vendorController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, vendorController.createVendor);
router.get('/', authenticateUser, vendorController.getVendors);
router.get('/user/:userId', authenticateUser, vendorController.getVendorsByUser);
router.get('/:id', authenticateUser, vendorController.getVendorById);
router.put('/:id', authenticateUser, vendorController.updateVendor);
router.delete('/:id', authenticateUser, vendorController.deleteVendor);
router.get('/count/:userId',vendorController.getVendorsCountByUser)
router.get('/count',vendorController.getVendorsCount)

export default router; 