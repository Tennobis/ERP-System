import { Router } from 'express';
import { projectController } from '../controllers/projectController';

const router = Router();

// Global task routes
router.get('/', projectController.listAllTasks);

export default router;
