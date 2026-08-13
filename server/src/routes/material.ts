import { Router } from 'express';
import { materialController } from '../controllers/materialController';
import { authenticateUser } from '../middleware/auth';
import { checkRole } from '../middleware/rbac';
import { validateMaterialRequest, validateMaterialRequestItem } from '../middleware/validation';

const router = Router();

// MaterialRequest CRUD
router.post('/material-requests', authenticateUser,  validateMaterialRequest, materialController.createMaterialRequest);
router.get('/material-requests', authenticateUser, materialController.listMaterialRequests);
router.get('/material-requests/user/:userId', authenticateUser, materialController.getMaterialRequestsByUser);
router.get('/material-requests/:id', authenticateUser, materialController.getMaterialRequest);
router.put('/material-requests/:id', authenticateUser,  validateMaterialRequest, materialController.updateMaterialRequest);
router.delete('/material-requests/:id', materialController.deleteMaterialRequest);

// Material Request Approval/Rejection
router.post('/material-requests/:id/approve', authenticateUser, materialController.approveMaterialRequest);
router.post('/material-requests/:id/reject', authenticateUser, materialController.rejectMaterialRequest);
router.post('/material-requests/:id/complete', authenticateUser, materialController.completeMaterialRequest);

// MaterialRequestItem CRUD
router.post('/material-requests/:materialRequestId/items', authenticateUser,  validateMaterialRequestItem, materialController.createMaterialRequestItem);
router.get('/material-requests/:materialRequestId/items', authenticateUser, materialController.listMaterialRequestItems);
router.get('/material-requests/:materialRequestId/items/:itemId', authenticateUser, materialController.getMaterialRequestItem);
router.put('/material-requests/:materialRequestId/items/:itemId', authenticateUser, validateMaterialRequestItem, materialController.updateMaterialRequestItem);
router.delete('/material-requests/:materialRequestId/items/:itemId', authenticateUser, materialController.deleteMaterialRequestItem);

export default router; 