import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const taxController = {
  // Tax CRUD Operations
  async createTax(req: Request, res: Response) {
    try {
      const tax = await prisma.tax.create({
        data: req.body,
        include: {
          user: true,
          taxCharges: true
        }
      });
      
      res.status(201).json(tax);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listTaxes(req: Request, res: Response) {
    try {
      const taxes = await prisma.tax.findMany({
        include: {
          user: true,
          taxCharges: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(taxes);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTax(req: Request, res: Response) {
    try {
      const tax = await prisma.tax.findUnique({
        where: { id: req.params.id },
        include: {
          user: true,
          taxCharges: true
        }
      });
      
      if (!tax) {
        return res.status(404).json({ error: 'Tax not found' });
      }
      
      res.json(tax);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTax(req: Request, res: Response) {
    try {
      const tax = await prisma.tax.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          user: true,
          taxCharges: true
        }
      });
      
      res.json(tax);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTax(req: Request, res: Response) {
    try {
      await prisma.tax.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // TaxCharge CRUD Operations
  async createTaxCharge(req: Request, res: Response) {
    try {
      const taxCharge = await prisma.taxCharge.create({
        data: req.body,
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        }
      });
      
      res.status(201).json(taxCharge);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listTaxCharges(req: Request, res: Response) {
    try {
      const taxCharges = await prisma.taxCharge.findMany({
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        },
        orderBy: {
          serialNo: 'asc'
        }
      });
      
      res.json(taxCharges);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTaxCharge(req: Request, res: Response) {
    try {
      const taxCharge = await prisma.taxCharge.findUnique({
        where: { id: req.params.id },
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        }
      });
      
      if (!taxCharge) {
        return res.status(404).json({ error: 'Tax charge not found' });
      }
      
      res.json(taxCharge);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTaxCharge(req: Request, res: Response) {
    try {
      const taxCharge = await prisma.taxCharge.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        }
      });
      
      res.json(taxCharge);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTaxCharge(req: Request, res: Response) {
    try {
      await prisma.taxCharge.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Tax-specific operations
  async getTaxesByUser(req: Request, res: Response) {
    try {
      const taxes = await prisma.tax.findMany({
        where: { userId: req.params.userId },
        include: {
          user: true,
          taxCharges: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(taxes);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTaxChargesByPayment(req: Request, res: Response) {
    try {
      const taxCharges = await prisma.taxCharge.findMany({
        where: { paymentId: req.params.paymentId },
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        },
        orderBy: {
          serialNo: 'asc'
        }
      });

      res.json(taxCharges);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTaxChargesByPurchaseOrder(req: Request, res: Response) {
    try {
      const taxCharges = await prisma.taxCharge.findMany({
        where: { purchaseOrderId: req.params.purchaseOrderId },
        include: {
          payment: true,
          tax: true,
          PurchaseOrder: true
        },
        orderBy: {
          serialNo: 'asc'
        }
      });
      
      res.json(taxCharges);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 