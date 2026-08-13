import { Router } from 'express';
import {
  getStoreOverview,
  getInventoryData,
  getStockLevels,
  getTransfers,
  getInventoryTurnover,
  getConsumptionTrends,
  getSupplierPerformance,
  getCostAnalysis
} from '../controllers/storeAnalyticsController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Overview Tab Routes
router.get('/overview', getStoreOverview);
router.get('/inventory-data', getInventoryData);
router.get('/stock-levels', getStockLevels);
router.get('/transfers', getTransfers);

// Analytics Tab Routes
router.get('/analytics/turnover', getInventoryTurnover);
router.get('/analytics/consumption', getConsumptionTrends);
router.get('/analytics/supplier-performance', getSupplierPerformance);
router.get('/analytics/cost-analysis', getCostAnalysis);

export default router;