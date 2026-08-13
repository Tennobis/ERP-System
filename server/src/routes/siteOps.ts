import { Router } from 'express';
import { siteOpsController } from '../controllers/siteOpsController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Equipment Maintenance
router.post('/equipment-maintenance', authenticateUser, siteOpsController.createEquipmentMaintenance);
router.get('/equipment-maintenance', authenticateUser, siteOpsController.getEquipmentMaintenances);
router.get('/equipment-maintenance/:id', authenticateUser, siteOpsController.getEquipmentMaintenanceById);
router.put('/equipment-maintenance/:id', authenticateUser, siteOpsController.updateEquipmentMaintenance);
router.delete('/equipment-maintenance/:id', authenticateUser, siteOpsController.deleteEquipmentMaintenance);

// Labor Log
router.post('/labor-log', authenticateUser, siteOpsController.createLaborLog);
router.get('/labor-log', authenticateUser, siteOpsController.getLaborLogs);
router.get('/labor-log/:id', authenticateUser, siteOpsController.getLaborLogById);
router.put('/labor-log/:id', authenticateUser, siteOpsController.updateLaborLog);
router.delete('/labor-log/:id', authenticateUser, siteOpsController.deleteLaborLog);

// Budget Adjustment
router.post('/budget-adjustment', authenticateUser, siteOpsController.createBudgetAdjustment);
router.get('/budget-adjustment', authenticateUser, siteOpsController.getBudgetAdjustments);
router.get('/budget-adjustment/:id', authenticateUser, siteOpsController.getBudgetAdjustmentById);
router.put('/budget-adjustment/:id', authenticateUser, siteOpsController.updateBudgetAdjustment);
router.delete('/budget-adjustment/:id', authenticateUser, siteOpsController.deleteBudgetAdjustment);

// Issue Report
router.post('/issue-report', authenticateUser, siteOpsController.createIssueReport);
router.get('/issue-report', authenticateUser, siteOpsController.getIssueReports);
router.get('/issue-report/:id', authenticateUser, siteOpsController.getIssueReportById);
router.put('/issue-report/:id', authenticateUser, siteOpsController.updateIssueReport);
router.delete('/issue-report/:id', authenticateUser, siteOpsController.deleteIssueReport);

// Daily Progress Report
router.post('/dpr', authenticateUser, siteOpsController.createDailyProgressReport);
router.get('/dpr', authenticateUser, siteOpsController.getDailyProgressReports);
router.get('/dpr/:id', authenticateUser, siteOpsController.getDailyProgressReportById);
router.put('/dpr/:id', authenticateUser, siteOpsController.updateDailyProgressReport);
router.delete('/dpr/:id', authenticateUser, siteOpsController.deleteDailyProgressReport);

// Weekly Progress Report
router.post('/wpr', authenticateUser, siteOpsController.createWeeklyProgressReport);
router.get('/wpr', authenticateUser, siteOpsController.getWeeklyProgressReports);
router.get('/wpr/:id', authenticateUser, siteOpsController.getWeeklyProgressReportById);
router.put('/wpr/:id', authenticateUser, siteOpsController.updateWeeklyProgressReport);
router.delete('/wpr/:id', authenticateUser, siteOpsController.deleteWeeklyProgressReport);

// Event
router.post('/event', authenticateUser, siteOpsController.createEvent);
router.get('/event', authenticateUser, siteOpsController.getEvents);
router.get('/event/:id', authenticateUser, siteOpsController.getEventById);
router.put('/event/:id', authenticateUser, siteOpsController.updateEvent);
router.delete('/event/:id', authenticateUser, siteOpsController.deleteEvent);

export default router; 