import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { recalculateProjectTotalSpend } from './projectController';

export const billingController = {
  async createInvoice(req: Request, res: Response) {
    try {
      const { projectId,items, ...invoiceData } = req.body;
      
      const invoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          projectId,
          items: {
            create: items || []
          }
        },
        include: {
          user: true,
          project: true,
          client: true,
          items: true,
          Payment: true
        }
      });
      await recalculateProjectTotalSpend(projectId)
      // Send notification to client
      // await prismaNotificationService.createNotification({
      //   to: invoice.clientId,
      //   type: 'invoice',
      //   message: `A new invoice has been created for you.`,
      // });
      
      res.status(201).json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listInvoices(req: Request, res: Response) {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          user: true,
          project: true,
          client: true,
          items: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.json(invoices);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listInvoicesByClient(req: Request, res: Response) {
    try {
      const {userId} = req.params
      const invoices = await prisma.invoice.findMany({
        where:{
          client: {
            createdById: userId // This links to clients created by this user
          }
        },
        include: {
          user: true,
          project: true,
          client: true,
          items: true,
          Payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      res.json(invoices);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getInvoice(req: Request, res: Response) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: {
          user: true,
          project: true,
          client: true,
          items: true,
          Payment: true
        }
      });
      
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      
      res.json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateInvoice(req: Request, res: Response) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          user: true,
          project: true,
          client: true,
          items: true,
          Payment: true
        }
      });
      await recalculateProjectTotalSpend(req.body.projectId)
      res.json(invoice);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteInvoice(req: Request, res: Response) {
    try {
      await prisma.invoice.delete({
        where: { id: req.params.id }
      });
      await recalculateProjectTotalSpend(req.params.id)
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Invoice Items CRUD
  async createInvoiceItem(req: Request, res: Response) {
    try {
      const invoiceItem = await prisma.invoiceItem.create({
        data: {
          ...req.body,
          invoiceId: req.params.invoiceId
        }
      });
      
      res.status(201).json(invoiceItem);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateInvoiceItem(req: Request, res: Response) {
    try {
      const invoiceItem = await prisma.invoiceItem.update({
        where: { id: req.params.itemId },
        data: req.body
      });
      
      res.json(invoiceItem);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteInvoiceItem(req: Request, res: Response) {
    try {
      await prisma.invoiceItem.delete({
        where: { id: req.params.itemId }
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

  // Payment endpoints
  async addPayment(req: Request, res: Response) {
    try {
      const { taxes, ...paymentData } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (paymentData.postingDate) {
        paymentData.postingDate = new Date(paymentData.postingDate);
      }
      const payment = await prisma.payment.create({
        data: {
          ...paymentData,
          invoiceId: req.params.id,
          userId: req.user.id,
          taxes: {
            create: taxes || []
          }
        },
        include: {
          user: true,
          project: true,
          Invoice: true,
          taxes: true
        }
      });
      
      // Check if invoice is now fully paid
      const invoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: { Payment: true },
      });
      
      if (invoice) {
        const totalPaid = invoice.Payment.reduce((sum: number, p: any) => sum + Number(p.total), 0);
        if (totalPaid >= invoice.total) {
          await prisma.invoice.update({ 
            where: { id: invoice.id }, 
            data: { status: 'PAID' } 
          });
          
          // Notify accounts and client
          await prismaNotificationService.createNotification({
            to: invoice.clientId,
            type: 'payment',
            message: `Your invoice has been fully paid.`
          });
        }
      }
      
      res.status(201).json(payment);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listPayments(req: Request, res: Response) {
    try {
      const payments = await prisma.payment.findMany({
        where: { invoiceId: req.params.id },
        include: {
          user: true,
          project: true,
          Invoice: true,
          taxes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(payments);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAllPayments(req: Request, res: Response) {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          user: true,
          project: true,
          Invoice: {
            include: {
              client: true
            }
          },
          taxes: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(payments);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 