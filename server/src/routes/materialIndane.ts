import { Router } from 'express';
import { materialIndaneController } from '../controllers/materialIndaneController';
import { authenticateUser } from '../middleware/auth';
import { uploadImage, uploadFile } from '../utils/multerConfig';

const router = Router();

// Material Indane Routes
router.post('/indanes', authenticateUser, materialIndaneController.createMaterialIndane);
router.get('/indanes', authenticateUser, materialIndaneController.getAllMaterialIndanes);
router.get('/indanes/user/:userId', authenticateUser, materialIndaneController.getMaterialIndanesByUser);
router.get('/indanes/:indaneId', authenticateUser, materialIndaneController.getMaterialIndaneById);
router.put('/indanes/:indaneId', authenticateUser, materialIndaneController.updateMaterialIndane);
router.delete('/indanes/:indaneId', authenticateUser, materialIndaneController.deleteMaterialIndane);

// Material Indane Item Routes
router.post('/indanes/:indaneId/items', authenticateUser, materialIndaneController.addItem);
router.put('/items/:itemId', authenticateUser, materialIndaneController.updateItem);
router.delete('/items/:itemId', authenticateUser, materialIndaneController.deleteItem);

// File Upload Routes
router.post('/indanes/:indaneId/upload/store-keeper-signature', authenticateUser, uploadImage.single('file'), materialIndaneController.uploadStoreKeeperSignature);
router.post('/indanes/:indaneId/upload/project-manager-signature', authenticateUser, uploadImage.single('file'), materialIndaneController.uploadProjectManagerSignature);
router.post('/indanes/:indaneId/upload/documents', authenticateUser, uploadFile.array('files', 10), materialIndaneController.uploadSupportingDocuments);
router.delete('/indanes/:indaneId/documents', authenticateUser, materialIndaneController.deleteSupportingDocument);

// Status Routes
router.patch('/indanes/:indaneId/approve', authenticateUser, materialIndaneController.approveMaterialIndane);
router.patch('/indanes/:indaneId/reject', authenticateUser, materialIndaneController.rejectMaterialIndane);
router.patch('/indanes/:indaneId/undo', authenticateUser, materialIndaneController.undoMaterialIndaneStatus);
router.get('/status/:status', authenticateUser, materialIndaneController.getMaterialIndanesByStatus);

export default router;
