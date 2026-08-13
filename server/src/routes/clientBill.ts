import { Router } from 'express';
import { clientBillController } from '../controllers/clientBillController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Client Bill routes
router.post('/', authenticateUser, clientBillController.createClientBill);
router.get('/', authenticateUser, clientBillController.listClientBills);
router.get('/count', authenticateUser, clientBillController.getClientBillsCount);
router.get('/user/:userId', authenticateUser, clientBillController.getClientBillsByUser);
router.get('/count/:userId', authenticateUser, clientBillController.getClientBillsCountByUser);
router.get('/invoice/:invoiceNo', authenticateUser, clientBillController.getClientBillByInvoiceNo);
router.get('/:id', authenticateUser, clientBillController.getClientBillById);
router.put('/:id', authenticateUser, clientBillController.updateClientBill);
router.delete('/:id', authenticateUser, clientBillController.deleteClientBill);

// Category routes
router.post('/:billId/categories', authenticateUser, clientBillController.createCategory);
router.get('/:billId/categories', authenticateUser, clientBillController.listCategories);
router.get('/:billId/categories/:categoryId', authenticateUser, clientBillController.getCategoryById);
router.put('/:billId/categories/:categoryId', authenticateUser, clientBillController.updateCategory);
router.delete('/:billId/categories/:categoryId', authenticateUser, clientBillController.deleteCategory);

// Line Item routes
router.post('/:billId/categories/:categoryId/line-items', authenticateUser, clientBillController.createLineItem);
router.get('/:billId/categories/:categoryId/line-items', authenticateUser, clientBillController.listLineItems);
router.get('/:billId/categories/:categoryId/line-items/:lineItemId', authenticateUser, clientBillController.getLineItemById);
router.put('/:billId/categories/:categoryId/line-items/:lineItemId', authenticateUser, clientBillController.updateLineItem);
router.delete('/:billId/categories/:categoryId/line-items/:lineItemId', authenticateUser, clientBillController.deleteLineItem);

// Approve/Reject routes
router.patch('/:id/approve', authenticateUser, clientBillController.approveClientBill);
router.patch('/:id/reject', authenticateUser, clientBillController.rejectClientBill);

export default router;
