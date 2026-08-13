import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const clientBillController = {
  async createClientBill(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { categories, ...billData } = req.body;

      const clientBill = await prisma.clientBill.create({
        data: {
          ...billData,
          createdById: req.user.id,
          categories: {
            create: categories?.map((category: any) => ({
              categoryCode: category.categoryCode,
              categoryName: category.categoryName,
              tower: category.tower,
              description: category.description,
              sequence: category.sequence,
              lineItems: {
                create: category.lineItems || []
              }
            })) || []
          }
        },
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        }
      });

      res.status(201).json(clientBill);
    } catch (error) {
      logger.error("Error creating client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listClientBills(req: Request, res: Response) {
    try {
      const { invoiceNo, contractorName, startDate, endDate } = req.query;

      const where: any = {};

      if (invoiceNo) where.invoiceNo = { contains: invoiceNo as string };
      if (contractorName) where.contractorName = { contains: contractorName as string };
      if (startDate || endDate) {
        where.invoiceDate = {};
        if (startDate) where.invoiceDate.gte = new Date(startDate as string);
        if (endDate) where.invoiceDate.lte = new Date(endDate as string);
      }

      const clientBills = await prisma.clientBill.findMany({
        where,
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(clientBills);
    } catch (error) {
      logger.error("Error listing client bills:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getClientBillById(req: Request, res: Response) {
    try {
      const clientBill = await prisma.clientBill.findUnique({
        where: { id: req.params.id },
        include: {
          categories: {
            include: {
              lineItems: true
            },
            orderBy: {
              sequence: 'asc'
            }
          },
          createdBy: true
        }
      });

      if (!clientBill) {
        return res.status(404).json({ error: 'Client bill not found' });
      }

      res.json(clientBill);
    } catch (error) {
      logger.error("Error getting client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getClientBillByInvoiceNo(req: Request, res: Response) {
    try {
      const clientBill = await prisma.clientBill.findUnique({
        where: { invoiceNo: req.params.invoiceNo },
        include: {
          categories: {
            include: {
              lineItems: true
            },
            orderBy: {
              sequence: 'asc'
            }
          },
          createdBy: true
        }
      });

      if (!clientBill) {
        return res.status(404).json({ error: 'Client bill not found' });
      }

      res.json(clientBill);
    } catch (error) {
      logger.error("Error getting client bill by invoice number:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateClientBill(req: Request, res: Response) {
    try {
      const { categories, ...billData } = req.body;

      const clientBill = await prisma.clientBill.update({
        where: { id: req.params.id },
        data: billData,
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        }
      });

      res.json(clientBill);
    } catch (error) {
      logger.error("Error updating client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteClientBill(req: Request, res: Response) {
    try {
      await prisma.clientBill.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const { lineItems, ...categoryData } = req.body;

      const category = await prisma.billCategory.create({
        data: {
          ...categoryData,
          clientBillId: req.params.billId,
          lineItems: {
            create: lineItems || []
          }
        },
        include: {
          lineItems: true,
          clientBill: true
        }
      });

      res.status(201).json(category);
    } catch (error) {
      logger.error("Error creating bill category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.billCategory.findMany({
        where: { clientBillId: req.params.billId },
        include: {
          lineItems: true
        },
        orderBy: {
          sequence: 'asc'
        }
      });

      res.json(categories);
    } catch (error) {
      logger.error("Error listing bill categories:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await prisma.billCategory.findUnique({
        where: { id: req.params.categoryId },
        include: {
          lineItems: true,
          clientBill: true
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      logger.error("Error getting bill category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const { lineItems, ...categoryData } = req.body;

      const category = await prisma.billCategory.update({
        where: { id: req.params.categoryId },
        data: categoryData,
        include: {
          lineItems: true,
          clientBill: true
        }
      });

      res.json(category);
    } catch (error) {
      logger.error("Error updating bill category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      await prisma.billCategory.delete({
        where: { id: req.params.categoryId }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting bill category:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createLineItem(req: Request, res: Response) {
    try {
      const lineItem = await prisma.billLineItem.create({
        data: {
          ...req.body,
          categoryId: req.params.categoryId
        },
        include: {
          category: true
        }
      });

      res.status(201).json(lineItem);
    } catch (error) {
      logger.error("Error creating line item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listLineItems(req: Request, res: Response) {
    try {
      const lineItems = await prisma.billLineItem.findMany({
        where: { categoryId: req.params.categoryId },
        include: {
          category: true
        },
        orderBy: {
          slNo: 'asc'
        }
      });

      res.json(lineItems);
    } catch (error) {
      logger.error("Error listing line items:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getLineItemById(req: Request, res: Response) {
    try {
      const lineItem = await prisma.billLineItem.findUnique({
        where: { id: req.params.lineItemId },
        include: {
          category: true
        }
      });

      if (!lineItem) {
        return res.status(404).json({ error: 'Line item not found' });
      }

      res.json(lineItem);
    } catch (error) {
      logger.error("Error getting line item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateLineItem(req: Request, res: Response) {
    try {
      const lineItem = await prisma.billLineItem.update({
        where: { id: req.params.lineItemId },
        data: req.body,
        include: {
          category: true
        }
      });

      res.json(lineItem);
    } catch (error) {
      logger.error("Error updating line item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteLineItem(req: Request, res: Response) {
    try {
      await prisma.billLineItem.delete({
        where: { id: req.params.lineItemId }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting line item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getClientBillsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const clientBills = await prisma.clientBill.findMany({
        where: {
          createdById: userId
        },
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(clientBills);
    } catch (error) {
      logger.error("Error getting client bills by user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getClientBillsCount(req: Request, res: Response) {
    try {
      const count = await prisma.clientBill.count();
      res.json({ count });
    } catch (error) {
      logger.error("Error getting client bills count:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getClientBillsCountByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const count = await prisma.clientBill.count({
        where: {
          createdById: userId
        }
      });
      res.json({ count });
    } catch (error) {
      logger.error("Error getting client bills count by user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async approveClientBill(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if client bill exists
      const existingBill = await prisma.clientBill.findUnique({
        where: { id }
      });

      if (!existingBill) {
        return res.status(404).json({ error: 'Client bill not found' });
      }

      // Update status to APPROVED
      const clientBill = await prisma.clientBill.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        }
      });

      logger.info(`Client bill ${id} approved by user ${req.user?.id}`);
      res.json(clientBill);
    } catch (error) {
      logger.error("Error approving client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async rejectClientBill(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if client bill exists
      const existingBill = await prisma.clientBill.findUnique({
        where: { id }
      });

      if (!existingBill) {
        return res.status(404).json({ error: 'Client bill not found' });
      }

      // Update status to REJECTED
      const clientBill = await prisma.clientBill.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          categories: {
            include: {
              lineItems: true
            }
          },
          createdBy: true
        }
      });

      logger.info(`Client bill ${id} rejected by user ${req.user?.id}`);
      res.json(clientBill);
    } catch (error) {
      logger.error("Error rejecting client bill:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
