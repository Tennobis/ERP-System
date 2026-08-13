import { Router } from 'express';
import { scheduleMaintenanceController } from '../controllers/scheduleMaintenanceController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Schedule Maintenance CRUD routes
router.post('/schedule-maintenance', authenticateUser, scheduleMaintenanceController.createScheduleMaintenance);
router.get('/schedule-maintenance', authenticateUser, scheduleMaintenanceController.listScheduleMaintenances);
router.get('/schedule-maintenances-global', authenticateUser, scheduleMaintenanceController.globalListScheduleMaintenances)
router.get('/schedule-maintenance/range', authenticateUser, scheduleMaintenanceController.getScheduleMaintenancesByDateRange);
router.get('/schedule-maintenance/priority/:priority', authenticateUser, scheduleMaintenanceController.getScheduleMaintenancesByPriority);
router.get('/schedule-maintenance/type/:type', authenticateUser, scheduleMaintenanceController.getScheduleMaintenancesByType);
router.get('/schedule-maintenance/:id', authenticateUser, scheduleMaintenanceController.getScheduleMaintenance);
router.put('/schedule-maintenance/:id', authenticateUser, scheduleMaintenanceController.updateScheduleMaintenance);
router.delete('/schedule-maintenance/:id', authenticateUser, scheduleMaintenanceController.deleteScheduleMaintenance);

export default router;
