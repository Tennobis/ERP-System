import { Router } from 'express';
import { billingController } from '../controllers/billingController';
import { authenticateUser } from '../middleware/auth';
import { validateInvoice, validatePayment } from '../middleware/validation';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Invoice CRUD
router.post('/invoices', authenticateUser, checkRole('accounts'), validateInvoice, billingController.createInvoice);
router.get('/invoices', authenticateUser, billingController.listInvoices);
router.get('/invoices/:userId', authenticateUser, billingController.listInvoicesByClient);
router.get('/invoices/:id', authenticateUser, billingController.getInvoice);
router.put('/invoices/:id', authenticateUser, validateInvoice, billingController.updateInvoice);
router.delete('/invoices/:id', authenticateUser, checkRole('admin'), billingController.deleteInvoice);

// Invoice Items CRUD
router.post('/invoices/:invoiceId/items', authenticateUser, checkRole('accounts'), billingController.createInvoiceItem);
router.put('/invoices/:invoiceId/items/:itemId', authenticateUser, checkRole('accounts'), billingController.updateInvoiceItem);
router.delete('/invoices/:invoiceId/items/:itemId', authenticateUser, checkRole('accounts'), billingController.deleteInvoiceItem);

// Payment management
router.post('/invoices/:id/payments', authenticateUser, checkRole('accounts'), validatePayment, billingController.addPayment);
router.get('/invoices/:id/payments', authenticateUser, billingController.listPayments);
router.get('/payments', authenticateUser, billingController.getAllPayments);

export default router; 