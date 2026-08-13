import { Request, Response, NextFunction } from 'express';
import { ROLES, UserRole } from '../utils/constants';
import { body } from 'express-validator';

export const isValidUrl = (url: string): boolean => {
  return /^https?:\/\//i.test(url);
};
export const validateAdminRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if all required fields are present
    if (!email || !password || !role || !name) {
      res.status(400).json({
        error: 'Missing required fields: email, password, role, and name are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role as UserRole)) {
      res.status(400).json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
      return;
    }

    // Validate name
    if (name.length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters long' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updates = req.body;

    // Validate role if provided
    if (updates.role !== undefined) {
      const validRoles = Object.values(ROLES);
      if (!validRoles.includes(updates.role as UserRole)) {
        res.status(400).json({
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
        return;
      }
    }

    // Validate avatar URL if provided
    if (updates.avatar !== undefined && updates.avatar !== null) {
      if (!isValidUrl(updates.avatar)) {
        res.status(400).json({
          error: 'Invalid avatar URL format. Must start with http:// or https://'
        });
        return;
      }
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.length < 2) {
        res.status(400).json({ error: 'Name must be at least 2 characters long' });
        return;
      }
    }

    // Validate email if provided
    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export const validateProject = [
  body('name').isString().notEmpty(),
  body('clientId').isString().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
];

export const validateInvoice = [
  body('projectId').isString().notEmpty(),
  body('clientId').isString().notEmpty(),
  body('amount').isFloat({ gt: 0 }),
  body('dueDate').isISO8601(),
];

export const validateInventoryItem = [
  body('itemName').isString().notEmpty(),
  body('category').isString().notEmpty(),
  body('quantity').isInt({ min: 0 }),
  body('unit').isString().notEmpty(),
  body('location').isString().notEmpty(),
  body('maximumStock').isInt({ min: 0 }),
  body('safetyStock').isInt({ min: 0 }),
  body('primarySupplierName').isString().notEmpty(),
  body('vendorId').isString().notEmpty(),
  body('secondarySupplierName').optional().isString(),
  body('secondaryVendorId').optional().isString(),
  body('unitCost').isInt({ min: 0 }),
  body('createdById').isString().notEmpty(),
];

export const validateMaterialRequest = [
  body('requestNumber').isString().notEmpty(),
  body('transactionDate').isISO8601(),
  body('purpose').isIn(['PURCHASE', 'TRANSFER', 'CONSUMPTION', 'MAINTENANCE', 'OTHER']),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('projectId').optional().isString(),
  body('targetWarehouse').optional().isString(),
  body('terms').optional().isString(),
  body('moreInfo').optional().isString(),
];

export const validateMaterialRequestItem = [
  body('itemCode').isString().notEmpty(),
  body('quantity').isFloat({ gt: 0 }),
  body('uom').isString().notEmpty(),
  body('requiredBy').optional().isString(),
  body('targetWarehouse').optional().isString(),
];

export const validateTender = [
  body('title').isString().notEmpty(),
  body('description').isString().notEmpty(),
  body('deadline').isISO8601(),
  body('budget').isFloat({ gt: 0 }),
];

export const validateBid = [
  body('vendorId').isString().notEmpty(),
  body('amount').isFloat({ gt: 0 }),
];

export const validateEmployee = [
  body('userId').isString().notEmpty(),
  body('position').isString().notEmpty(),
  body('department').isString().notEmpty(),
  body('salary').isFloat({ gt: 0 }),
  body('joinedAt').isISO8601(),
];

export const validatePayment = [
  body('paymentType').isIn(['RECEIVE', 'PAY']),
  body('postingDate').isISO8601(),
  body('partyType').isIn(['CUSTOMER', 'VENDOR', 'EMPLOYEE', 'BANK']),
  body('party').isString().notEmpty(),
  body('partyName').isString().notEmpty(),
  body('accountPaidTo').isString().notEmpty(),
  body('total').isFloat({ gt: 0 }),
  body('projectId').isString().notEmpty(),
];

export const validateNotification = [
  body('to').isString().notEmpty(),
  body('type').isString().notEmpty(),
  body('message').isString().notEmpty(),
];

export const validateMessage = [
  body('from').isString().notEmpty(),
  body('to').isString().notEmpty(),
  body('content').isString().notEmpty(),
];