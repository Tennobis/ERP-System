import { Router } from 'express';
import { warehouseController } from '../controllers/warehouseController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Warehouse CRUD
router.post('/', authenticateUser, warehouseController.createWarehouse);
router.get('/', authenticateUser, warehouseController.listWarehouses);
router.get('/:id', authenticateUser, warehouseController.getWarehouse);
router.put('/:id', authenticateUser, warehouseController.updateWarehouse);
router.delete('/:id', authenticateUser, warehouseController.deleteWarehouse);

export default router;
