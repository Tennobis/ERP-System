import { Router } from 'express';
import { designController } from '../controllers/designController';
import { authenticateUser } from '../middleware/auth';
import { uploadMultipleFiles, uploadMultipleImages } from '../utils/multerConfig';

const router = Router();

// Design CRUD - Global routes (fetch all designs)
router.get('/', authenticateUser, designController.listAllDesigns);

// File upload routes
router.post('/:userId/upload/files', authenticateUser, uploadMultipleFiles.array('files', 10), designController.uploadDesignFiles);
router.post('/:userId/upload/images', authenticateUser, uploadMultipleImages.array('images', 10), designController.uploadDesignImages);

// Design CRUD - User specific routes (by createdById)
router.post('/:userId', authenticateUser, designController.createDesign);
router.get('/:userId', authenticateUser, designController.listDesignsByUser);
router.get('/:id', authenticateUser, designController.getDesign);
router.put('/:id', authenticateUser, designController.updateDesign);
router.delete('/:id', authenticateUser, designController.deleteDesign);

// Additional filter routes
router.get('/client/:clientId', authenticateUser, designController.getDesignsByClient);
router.get('/project/:projectId', authenticateUser, designController.getDesignsByProject);

export default router;
