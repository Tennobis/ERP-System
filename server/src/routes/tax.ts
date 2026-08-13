import { Router } from 'express';
import { taxController } from '../controllers/taxController';
import { authenticateUser } from '../middleware/auth';
import { checkRole, checkAnyRole } from '../middleware/rbac';

const router = Router();

// Tax CRUD
router.post('/taxes', authenticateUser, checkRole('accounts'), taxController.createTax);
router.get('/taxes', authenticateUser, taxController.listTaxes);
router.get('/taxes/:id', authenticateUser, taxController.getTax);
router.put('/taxes/:id', authenticateUser, checkRole('accounts'), taxController.updateTax);
router.delete('/taxes/:id', authenticateUser, checkAnyRole(['admin', 'accounts']), taxController.deleteTax);

// Tax by user
router.get('/users/:userId/taxes', authenticateUser, taxController.getTaxesByUser);

// TaxCharge CRUD
router.post('/tax-charges', authenticateUser, checkRole('accounts'), taxController.createTaxCharge);
router.get('/tax-charges', authenticateUser, taxController.listTaxCharges);
router.get('/tax-charges/:id', authenticateUser, taxController.getTaxCharge);
router.put('/tax-charges/:id', authenticateUser, checkRole('accounts'), taxController.updateTaxCharge);
router.delete('/tax-charges/:id', authenticateUser, checkAnyRole(['admin', 'accounts']), taxController.deleteTaxCharge);

// TaxCharge by payment
router.get('/payments/:paymentId/tax-charges', authenticateUser, taxController.getTaxChargesByPayment);

// TaxCharge by purchase order
router.get('/purchase-orders/:purchaseOrderId/tax-charges', authenticateUser, taxController.getTaxChargesByPurchaseOrder);

export default router; 