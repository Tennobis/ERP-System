import { Router } from 'express';
import { progressReportController } from '../controllers/progressReportController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// DPR Routes
router.post('/dpr', authenticateUser, progressReportController.createDPR);
router.get('/dpr/user/:userId', authenticateUser, progressReportController.getDPRsByUser);
router.get('/dpr/all', authenticateUser, progressReportController.getAllDPRs);
router.get('/dpr/:dprId', authenticateUser, progressReportController.getDPRById);
router.put('/dpr/:dprId', authenticateUser, progressReportController.updateDPR);
router.delete('/dpr/:dprId', authenticateUser, progressReportController.deleteDPR);

// DPR Work Item Routes
router.post('/dpr/:dprId/work-items', authenticateUser, progressReportController.addWorkItem);
router.put('/work-items/:workItemId', authenticateUser, progressReportController.updateWorkItem);
router.delete('/work-items/:workItemId', authenticateUser, progressReportController.deleteWorkItem);

// DPR Resource Routes
router.post('/dpr/:dprId/resources', authenticateUser, progressReportController.addResource);
router.put('/resources/:resourceId', authenticateUser, progressReportController.updateResource);
router.delete('/resources/:resourceId', authenticateUser, progressReportController.deleteResource);

// DPR Remarks Routes
router.post('/dpr/:dprId/remarks', authenticateUser, progressReportController.addRemark);
router.put('/remarks/:remarkId', authenticateUser, progressReportController.updateRemark);
router.delete('/remarks/:remarkId', authenticateUser, progressReportController.deleteRemark);

// WPR Routes  
router.post('/wpr', authenticateUser, progressReportController.createWPR);
router.get('/wpr/user/:userId', authenticateUser, progressReportController.getWPRsByUser);
router.get('/wpr/all', authenticateUser, progressReportController.getAllWPRs);
router.get('/wpr/:wprId', authenticateUser, progressReportController.getWPRById);
router.put('/wpr/:wprId', authenticateUser, progressReportController.updateWPR);
router.delete('/wpr/:wprId', authenticateUser, progressReportController.deleteWPR);

export default router;
