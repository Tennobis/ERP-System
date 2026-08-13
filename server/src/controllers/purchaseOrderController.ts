import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const purchaseOrderController = {
  // Purchase Orders
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const { items, taxesAndCharges, paymentSchedule, ...purchaseOrderData } = req.body;
      
      // Prepare nested data for Prisma
      const data: any = {
        ...purchaseOrderData,
        date: new Date(purchaseOrderData.date),
        requiredBy: new Date(purchaseOrderData.requiredBy),
      };

      // Add items if they exist
      if (items && items.length > 0) {
        data.items = {
          create: items.map((item: any) => {
            const { id, ...itemData } = item; // Remove frontend-generated id
            return {
              ...itemData,
              requiredBy: new Date(itemData.requiredBy),
              quantity: parseFloat(itemData.quantity),
              rate: parseFloat(itemData.rate),
              amount: parseFloat(itemData.amount),
            };
          })
        };
      }

      // Add taxes and charges if they exist
      if (taxesAndCharges && taxesAndCharges.length > 0) {
        data.taxesAndCharges = {
          create: taxesAndCharges.map((tax: any, index: number) => {
            const { id, ...taxData } = tax; // Remove frontend-generated id
            return {
              ...taxData,
              serialNo: index + 1,
              type: (['TDS', 'GST', 'TCS'].includes(tax.type?.toUpperCase())) ? tax.type.toUpperCase() : 'GST', // Convert to enum value
              taxRate: parseFloat(taxData.taxRate),
              amount: parseFloat(taxData.amount),
              total: parseFloat(taxData.total),
            };
          })
        };
      }

      // Add payment schedule if it exists
      if (paymentSchedule && paymentSchedule.length > 0) {
        data.paymentSchedule = {
          create: paymentSchedule.map((term: any) => {
            const { id, ...termData } = term; // Remove frontend-generated id
            return {
              ...termData,
              dueDate: new Date(termData.dueDate),
              invoicePortion: parseFloat(termData.invoicePortion),
              paymentAmount: parseFloat(termData.paymentAmount),
            };
          })
        };
      }

      const po = await prisma.purchaseOrder.create({ 
        data,
        include: { items: true, paymentSchedule: true, taxesAndCharges: true, GRN: true, Vendor: true } 
      });
      res.status(201).json(po);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrders(req: Request, res: Response) {
    try {
      const pos = await prisma.purchaseOrder.findMany({ 
        include: { items: true, paymentSchedule: true, GRN: true, Vendor: true },
        where: req.query as any
      });
      res.json(pos);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrdersByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const pos = await prisma.purchaseOrder.findMany({
        where: {
          userId: userId
        },
        include: { items: true, paymentSchedule: true, GRN: true, Vendor: true }
      });
      res.json(pos);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const po = await prisma.purchaseOrder.findUnique({ 
        where: { id: req.params.id },
        include: { items: true, paymentSchedule: true }
      });
      res.json(po);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updatePurchaseOrder(req: Request, res: Response) {
    try {
      logger.info(`Updating purchase order ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
      const { items, taxesAndCharges, paymentSchedule, ...purchaseOrderData } = req.body;
      
      // Prepare nested data for Prisma update
      const data: any = {
        ...purchaseOrderData,
      };

      // Only update date fields if they exist and are valid
      if (purchaseOrderData.date) {
        data.date = new Date(purchaseOrderData.date);
      }
      if (purchaseOrderData.requiredBy) {
        data.requiredBy = new Date(purchaseOrderData.requiredBy);
      }

      // Update items - always delete existing and recreate
      if (items !== undefined) {
        data.items = {
          deleteMany: {},
        };
        
        if (items.length > 0) {
          data.items.create = items.map((item: any) => {
            const { id, purchaseOrderId, ...itemData } = item; // Remove frontend-generated id
            return {
              ...itemData,
              requiredBy: itemData.requiredBy ? new Date(itemData.requiredBy) : new Date(purchaseOrderData.requiredBy),
              quantity: parseFloat(itemData.quantity) || 0,
              rate: parseFloat(itemData.rate) || 0,
              amount: parseFloat(itemData.amount) || 0,
            };
          });
        }
      }

      // Update taxes and charges - always delete existing and recreate
      if (taxesAndCharges !== undefined) {
        data.taxesAndCharges = {
          deleteMany: {},
        };
        
        if (taxesAndCharges.length > 0) {
          data.taxesAndCharges.create = taxesAndCharges.map((tax: any, index: number) => {
            const { id, purchaseOrderId, ...taxData } = tax; // Remove frontend-generated id
            return {
              ...taxData,
              serialNo: index + 1,
              type: (['TDS', 'GST', 'TCS'].includes(tax.type?.toUpperCase())) ? tax.type.toUpperCase() : 'GST',
              taxRate: parseFloat(taxData.taxRate) || 0,
              amount: parseFloat(taxData.amount) || 0,
              total: parseFloat(taxData.total) || 0,
            };
          });
        }
      }

      // Update payment schedule - always delete existing and recreate
      if (paymentSchedule !== undefined) {
        data.paymentSchedule = {
          deleteMany: {},
        };
        
        if (paymentSchedule.length > 0) {
          data.paymentSchedule.create = paymentSchedule.map((term: any) => {
            const { id, purchaseOrderId, ...termData } = term; // Remove frontend-generated id
            return {
              ...termData,
              dueDate: termData.dueDate ? new Date(termData.dueDate) : new Date(),
              invoicePortion: parseFloat(termData.invoicePortion) || 0,
              paymentAmount: parseFloat(termData.paymentAmount) || 0,
            };
          });
        }
      }

      const po = await prisma.purchaseOrder.update({ 
        where: { id: req.params.id }, 
        data,
        include: { items: true, paymentSchedule: true, taxesAndCharges: true, GRN: true, Vendor: true }
      });
      res.json(po);
    } catch (error) {
      logger.error("Error updating purchase order:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deletePurchaseOrder(req: Request, res: Response) {
    try {
      await prisma.purchaseOrder.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Purchase Order Items
  async addPurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prisma.purchaseOrderItem.create({ 
        data: { ...req.body, purchaseOrderId: req.params.poId }
      });
      res.status(201).json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrderItems(req: Request, res: Response) {
    try {
      const items = await prisma.purchaseOrderItem.findMany({
        include: { purchaseOrder: true },
        where: req.query as any
      });
      res.json(items);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPurchaseOrderItemById(req: Request, res: Response) {
    try {
      const item = await prisma.purchaseOrderItem.findUnique({ 
        where: { id: req.params.id },
        include: { purchaseOrder: true }
      });
      res.json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updatePurchaseOrderItem(req: Request, res: Response) {
    try {
      const item = await prisma.purchaseOrderItem.update({ 
        where: { id: req.params.id }, 
        data: req.body
      });
      res.json(item);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deletePurchaseOrderItem(req: Request, res: Response) {
    try {
      await prisma.purchaseOrderItem.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Payment Terms
  async addPaymentTerm(req: Request, res: Response) {
    try {
      const paymentTerm = await prisma.paymentTerm.create({ 
        data: { ...req.body, purchaseOrderId: req.params.poId }
      });
      res.status(201).json(paymentTerm);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPaymentTerms(req: Request, res: Response) {
    try {
      const paymentTerms = await prisma.paymentTerm.findMany({
        include: { purchaseOrder: true },
        where: req.query as any
      });
      res.json(paymentTerms);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getPaymentTermById(req: Request, res: Response) {
    try {
      const paymentTerm = await prisma.paymentTerm.findUnique({ 
        where: { id: req.params.id },
        include: { purchaseOrder: true }
      });
      res.json(paymentTerm);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updatePaymentTerm(req: Request, res: Response) {
    try {
      const paymentTerm = await prisma.paymentTerm.update({ 
        where: { id: req.params.id }, 
        data: req.body
      });
      res.json(paymentTerm);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deletePaymentTerm(req: Request, res: Response) {
    try {
      await prisma.paymentTerm.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // GRN
  async createGRN(req: Request, res: Response) {
    try {
      const grn = await prisma.gRN.create({ 
        data: req.body,
        include: { purchaseOrder: true }
      });
      res.status(201).json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getGRNs(req: Request, res: Response) {
    try {
      const grns = await prisma.gRN.findMany({ 
        include: { purchaseOrder: true },
        where: req.query as any
      });
      res.json(grns);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getGRNById(req: Request, res: Response) {
    try {
      const grn = await prisma.gRN.findUnique({ 
        where: { id: req.params.id },
        include: { purchaseOrder: true }
      });
      res.json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateGRN(req: Request, res: Response) {
    try {
      const grn = await prisma.gRN.update({ 
        where: { id: req.params.id }, 
        data: req.body
      });
      res.json(grn);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteGRN(req: Request, res: Response) {
    try {
      await prisma.gRN.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Vendors for Purchase Orders
  async getVendorsForPO(req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          mobile: true,
          category: true,
          location: true
        }
      });
      res.json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}; 