import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const accountsController = {
  async createPayment(req: Request, res: Response) {
    try {
      const payment = await prisma.payment.create({
        data: req.body,
        include: {
          user: true,
          project: true,
          Invoice: true,
          taxes: true
        }
      });
      
      // Notify invoice client and accounts team
      const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (invoice) {
        await prismaNotificationService.createNotification({
          to: invoice.clientId,
          type: 'payment',
          message: `A payment has been recorded for your invoice.`
        });
        const accountsUsers = await prisma.user.findMany({ where: { role: 'accounts' } });
        await Promise.all(accountsUsers.map(user =>
          prismaNotificationService.createNotification({
            to: user.id,
            type: 'payment',
            message: `A new payment has been recorded.`
          })
        ));
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

  async getPayment(req: Request, res: Response) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
        include: {
          user: true,
          project: true,
          Invoice: true,
          taxes: true
        }
      });
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updatePayment(req: Request, res: Response) {
    try {
      const payment = await prisma.payment.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          user: true,
          project: true,
          Invoice: true,
          taxes: true
        }
      });
      
      res.json(payment);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deletePayment(req: Request, res: Response) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id }
      });
      
      await prisma.payment.delete({
        where: { id: req.params.id }
      });
      
      // Notify accounts team
      const accountsUsers = await prisma.user.findMany({ where: { role: 'accounts' } });
      await Promise.all(accountsUsers.map(user =>
        prismaNotificationService.createNotification({
          to: user.id,
          type: 'payment-removed',
          message: `A payment has been deleted.`
        })
      ));
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Additional accounts-specific endpoints
  async getCollections(req: Request, res: Response) {
    try {
      const collections = await prisma.payment.findMany({
        where: {
          paymentType: 'RECEIVE'
        },
        include: {
          user: true,
          project: true,
          Invoice: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(collections);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getCollectionTrends(req: Request, res: Response) {
    try {
      // Get monthly collection trends - using available fields
      const trends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(CASE WHEN "paymentType" = 'RECEIVE' THEN 1 END) as collected_count,
          COUNT(*) as total_transactions
        FROM "Payment"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `;
      
      res.json(trends);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getBudget(req: Request, res: Response) {
    try {
      // Get budget vs actual data for projects - using available fields
      const budgetData = await prisma.$queryRaw`
        SELECT 
          p.name as project,
          10000000 as budgeted, -- Placeholder budget amount
          COALESCE(COUNT(po.id) * 500000, 0) as actual, -- Placeholder calculation
          10000000 - COALESCE(COUNT(po.id) * 500000, 0) as variance
        FROM "Project" p
        LEFT JOIN "PurchaseOrder" po ON p.id = po."projectId"
        WHERE p.status = 'active'
        GROUP BY p.id, p.name
        ORDER BY variance ASC
      `;
      
      res.json(budgetData);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // async getPayrollStats(req: Request, res: Response) {
  //   try {
  //     const totalEmployees = await prisma.employee.count({
  //       where: {
  //         leftAt: null
  //       }
  //     });
      
  //     const payrollAmount = await prisma.employee.aggregate({
  //       where: {
  //         leftAt: null
  //       },
  //       // _sum: {
  //       //   salary: true
  //       // }
  //     });
      
  //     const avgSalary = await prisma.employee.aggregate({
  //       where: {
  //         leftAt: null
  //       },
  //       // _avg: {
  //       //   salary: true
  //       // }
  //     });
      
  //     res.json({
  //       totalEmployees,
  //       payrollAmount: `₹${((payrollAmount._sum.salary || 0) / 1000000).toFixed(1)}M`,
  //       avgSalary: `₹${((avgSalary._avg.salary || 0) / 1000).toFixed(0)}K`,
  //       compliance: '98%'
  //     });
  //   } catch (error) {
  //     logger.error("Error:", error);
  //     res.status(500).json({
  //       message: "Internal server error",
  //       error: error instanceof Error ? error.message : "Unknown error",
  //     });
  //   }
  // }
}; 