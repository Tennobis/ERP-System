import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all vehicle routes
router.use(authenticateUser as any);

// Vehicle CRUD Routes
router.post('/', vehicleController.createVehicle as any);
router.get('/', vehicleController.getVehicles as any);
router.get('/analytics', vehicleController.getVehicleAnalytics as any);
router.get('/:id', vehicleController.getVehicleById as any);
router.put('/:id', vehicleController.updateVehicle as any);
router.delete('/:id', vehicleController.deleteVehicle as any);

// Vehicle Movement Routes
router.post('/movements', vehicleController.createVehicleMovement as any);
router.get('/movements/list', vehicleController.getVehicleMovements as any);
router.put('/movements/:id', vehicleController.updateVehicleMovement as any);
router.delete('/movements/:id', vehicleController.deleteVehicleMovement as any);

// Vehicle Maintenance Routes
router.post('/maintenance', vehicleController.createMaintenance as any);
router.get('/maintenance/list', vehicleController.getMaintenanceRecords as any);
router.put('/maintenance/:id', vehicleController.updateMaintenance as any);
router.delete('/maintenance/:id', vehicleController.deleteMaintenance as any);

export default router;
