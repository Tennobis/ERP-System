import { Router } from 'express';
import { purchaseOrderController } from '../controllers/purchaseOrderController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Purchase Orders
router.post('/', authenticateUser, purchaseOrderController.createPurchaseOrder);
router.get('/', authenticateUser, purchaseOrderController.getPurchaseOrders);
router.get('/user/:userId', authenticateUser, purchaseOrderController.getPurchaseOrdersByUser);
router.get('/:id', authenticateUser, purchaseOrderController.getPurchaseOrderById);
router.put('/:id', authenticateUser, purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', authenticateUser, purchaseOrderController.deletePurchaseOrder);

// Purchase Order Items
router.post('/:poId/items', authenticateUser, purchaseOrderController.addPurchaseOrderItem);
router.get('/items', authenticateUser, purchaseOrderController.getPurchaseOrderItems);
router.get('/items/:id', authenticateUser, purchaseOrderController.getPurchaseOrderItemById);
router.put('/items/:id', authenticateUser, purchaseOrderController.updatePurchaseOrderItem);
router.delete('/items/:id', authenticateUser, purchaseOrderController.deletePurchaseOrderItem);

// Payment Terms
router.post('/:poId/payment-terms', authenticateUser, purchaseOrderController.addPaymentTerm);
router.get('/payment-terms', authenticateUser, purchaseOrderController.getPaymentTerms);
router.get('/payment-terms/:id', authenticateUser, purchaseOrderController.getPaymentTermById);
router.put('/payment-terms/:id', authenticateUser, purchaseOrderController.updatePaymentTerm);
router.delete('/payment-terms/:id', authenticateUser, purchaseOrderController.deletePaymentTerm);

// GRN
router.post('/grn', authenticateUser, purchaseOrderController.createGRN);
router.get('/grn', authenticateUser, purchaseOrderController.getGRNs);
router.get('/grn/:id', authenticateUser, purchaseOrderController.getGRNById);
router.put('/grn/:id', authenticateUser, purchaseOrderController.updateGRN);
router.delete('/grn/:id', authenticateUser, purchaseOrderController.deleteGRN);

// Vendors for Purchase Orders
router.get('/vendors', authenticateUser, purchaseOrderController.getVendorsForPO);

export default router; 