import { Router } from 'express';
import { nonBillableController } from '../controllers/nonBillableController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Non-billable CRUD operations
router.post('/', authenticateUser, nonBillableController.createNonBillable);
router.get('/', nonBillableController.listNonBillables); // Allow without auth for dashboard
router.get('/labour-wages', nonBillableController.getLabourWages); // Special endpoint for labour wages
router.get('/:id', authenticateUser, nonBillableController.getNonBillable);
router.put('/:id', authenticateUser, nonBillableController.updateNonBillable);
router.delete('/:id', authenticateUser, nonBillableController.deleteNonBillable);
 
export default router;
