import { Router } from 'express';
import { milestoneController } from '../controllers/milestoneController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Milestone CRUD routes
router.post('/project/:projectId', authenticateUser, milestoneController.createMilestone);
router.post('/project/:projectId/multiple', authenticateUser, milestoneController.createMultipleMilestones);
router.get('/project/:projectId', authenticateUser, milestoneController.listMilestones);
router.get('/:milestoneId', authenticateUser, milestoneController.getMilestone);
router.put('/:milestoneId', authenticateUser, milestoneController.updateMilestone);
router.delete('/:milestoneId', authenticateUser, milestoneController.deleteMilestone);

export default router;
