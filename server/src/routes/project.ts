import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticateUser } from '../middleware/auth';
import { validateProject } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Project CRUD
router.post('/user/:userId', authenticateUser, /* checkRole('site'), validateProject, */ projectController.createProject);
router.get('/', projectController.listProjects); // Removed authenticateUser
router.get('/user/:userId', authenticateUser, projectController.getProjectsByUser);

// Specific routes must come before parameterized routes
router.get('/activity', projectController.getProjectActivity);

router.get('/:id', authenticateUser, projectController.getProject);
router.put('/:id', authenticateUser, validateProject, projectController.updateProject);
router.delete('/:id', authenticateUser, projectController.deleteProject);

// Task management
router.post('/:userId/tasks', authenticateUser, /* checkRole('site-manager'), */ projectController.createTask);
router.get('/:userId/tasks', authenticateUser, projectController.listTasks);
router.get('/:userId/tasks/:taskId', authenticateUser, projectController.getTask);
router.put('/:userId/tasks/:taskId', authenticateUser, /* checkRole('site-manager'), */ projectController.updateTask);
router.delete('/:userId/tasks/:taskId', authenticateUser, projectController.deleteTask);

// Non-billable management
router.post('/:id/non-billables', authenticateUser, projectController.addNonBillable);
router.get('/:id/non-billables', authenticateUser, projectController.listNonBillables);
router.put('/:id/non-billables/:nonBillableId', authenticateUser, projectController.updateNonBillable);
router.delete('/:id/non-billables/:nonBillableId', authenticateUser, projectController.deleteNonBillable);
router.post('/:id/recalculate-total', authenticateUser, projectController.recalculateTotalSpend);

// Update project spent
router.put('/:id/update-spent', authenticateUser, projectController.updateSpent);

export default router; 