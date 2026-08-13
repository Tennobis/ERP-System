import { Router } from 'express';
import { tenderController } from '../controllers/tenderController';
import { authenticateUser } from '../middleware/auth';
import { validateTender, validateBid } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';
import { UserRole } from '@prisma/client';

const router = Router();

// Tender CRUD
router.post('/', authenticateUser, validateTender, tenderController.createTender);
router.get('/', authenticateUser, tenderController.listTenders);
router.get('/:id', authenticateUser, tenderController.getTender);
router.put('/:id', authenticateUser,  validateTender, tenderController.updateTender);
router.delete('/:id', authenticateUser,  tenderController.deleteTender);

// Tender Requirements CRUD
router.post('/:tenderId/requirements', authenticateUser, tenderController.createTenderRequirement);
router.get('/:tenderId/requirements', authenticateUser, tenderController.listTenderRequirements);
router.get('/:tenderId/requirements/:requirementId', authenticateUser, tenderController.getTenderRequirement);
router.put('/:tenderId/requirements/:requirementId', authenticateUser, tenderController.updateTenderRequirement);
router.delete('/:tenderId/requirements/:requirementId', authenticateUser, tenderController.deleteTenderRequirement);

// Bid management
router.post('/:id/bids', authenticateUser, checkRole('client-manager'), validateBid, tenderController.createBid);
router.get('/:id/bids', authenticateUser, tenderController.listBids);
router.put('/:id/bids/:bidId', authenticateUser, checkRole('client-manager'), validateBid, tenderController.updateBid);

export default router; 