import { Router } from 'express';
import { boqController } from '../controllers/boqController';
import { authenticateUser } from '../middleware/auth';
import { checkRole, checkAnyRole } from '../middleware/rbac';

const router = Router();

// BOQ CRUD operations
router.post('/', authenticateUser, boqController.createBOQ);
router.get('/', authenticateUser, boqController.listBOQs);
router.get('/:id', authenticateUser, boqController.getBOQ);
router.put('/:id', authenticateUser, boqController.updateBOQ);
router.delete('/:id', authenticateUser, boqController.deleteBOQ);

export default router;
