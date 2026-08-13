import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const materialController = {
  // MaterialRequest CRUD Operations
  async createMaterialRequest(req: Request, res: Response) {
    try {
      const { items, requester, project, approver, ...materialRequestData } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const materialRequest = await prisma.materialRequest.create({
        data: {
          ...materialRequestData,
          requestedBy: req.user.id,
          items: {
            create: items || []
          }
        },
        include: {
          requester: true,
          project: true
        }
      });
      
      // Send notification to approver if specified
      if (materialRequestData.approvedBy) {
        await prismaNotificationService.createNotification({
          to: materialRequestData.approvedBy,
          type: 'material_request',
          message: `A new material request (${materialRequest.id}) has been submitted for your approval.`,
        });
      }
      
      res.status(201).json(materialRequest);
    } catch (error) {
      logger.error("Error creating material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listMaterialRequests(req: Request, res: Response) {
    try {
      const { status, purpose, projectId, requestedBy } = req.query;
      
      const where: any = {};
      
      if (status) where.status = status;
      if (purpose) where.purpose = purpose;
      if (projectId) where.projectId = projectId;
      if (requestedBy) where.requestedBy = requestedBy;

      const materialRequests = await prisma.materialRequest.findMany({
        where,
        include: {
          requester: true,
          project: true,
          items:true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(materialRequests);
    } catch (error) {
      logger.error("Error listing material requests:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  
  async getMaterialRequestsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const materialRequests = await prisma.materialRequest.findMany({
        where: {
          requestedBy: userId
        },
        include: {
          requester: true,
          project: true,
          items: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(materialRequests);
    } catch (error) {
      logger.error("Error listing material requests by user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getMaterialRequest(req: Request, res: Response) {
    try {
      const materialRequest = await prisma.materialRequest.findUnique({
        where: { id: req.params.id },
        include: {
          requester: true,
          project: true,
          items: true
        }
      });
      
      if (!materialRequest) {
        return res.status(404).json({ error: 'Material request not found' });
      }
      
      res.json(materialRequest);
    } catch (error) {
      logger.error("Error getting material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateMaterialRequest(req: Request, res: Response) {
    try {
      const materialRequest = await prisma.materialRequest.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          requester: true,
          project: true,
          items: true
        }
      });
      
      res.json(materialRequest);
    } catch (error) {
      logger.error("Error updating material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteMaterialRequest(req: Request, res: Response) {
    try {
      await prisma.materialRequest.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Material Request Approval/Rejection
  async approveMaterialRequest(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const materialRequest = await prisma.materialRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'IN_PROGRESS',
          approvedBy: req.user.id
        },
        include: {
          requester: true,
          project: true,
          items: true
        }
      });
      
      // Notify requester
      await prismaNotificationService.createNotification({
        to: materialRequest.requestedBy,
        type: 'material_request_approved',
        message: `Your material request (${materialRequest.id}) has been approved.`,
      });
      
      res.json(materialRequest);
    } catch (error) {
      logger.error("Error approving material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async rejectMaterialRequest(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const materialRequest = await (prisma as any).materialRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'REJECTED',
          approvedBy: req.user.id,
          rejectionReason: rejectionReason
        },
        include: {
          requester: true,
          project: true,
          items: true
        }
      });
      
      // Notify requester
      await prismaNotificationService.createNotification({
        to: materialRequest.requestedBy,
        type: 'material_request_rejected',
        message: `Your material request (${materialRequest.id}) has been rejected. Reason: ${rejectionReason}`,
      });
      
      res.json(materialRequest);
    } catch (error) {
      logger.error("Error rejecting material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async completeMaterialRequest(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const materialRequest = await prisma.materialRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'COMPLETED'
        },
        include: {
          requester: true,
          project: true,
          items: true
        }
      });
      
      // Notify requester
      await prismaNotificationService.createNotification({
        to: materialRequest.requestedBy,
        type: 'material_request_completed',
        message: `Your material request (${materialRequest.id}) has been marked as completed.`,
      });
      
      res.json(materialRequest);
    } catch (error) {
      logger.error("Error completing material request:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // MaterialRequestItem CRUD Operations
  async createMaterialRequestItem(req: Request, res: Response) {
    try {
      const materialRequestItem = await (prisma as any).materialRequestItem.create({
        data: {
          ...req.body,
          materialRequestId: req.params.materialRequestId
        },
        include: {
          materialRequest: true
        }
      });
      
      res.status(201).json(materialRequestItem);
    } catch (error) {
      logger.error("Error creating material request item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateMaterialRequestItem(req: Request, res: Response) {
    try {
      const materialRequestItem = await (prisma as any).materialRequestItem.update({
        where: { id: req.params.itemId },
        data: req.body,
        include: {
          materialRequest: true
        }
      });
      
      res.json(materialRequestItem);
    } catch (error) {
      logger.error("Error updating material request item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteMaterialRequestItem(req: Request, res: Response) {
    try {
      await (prisma as any).materialRequestItem.delete({
        where: { id: req.params.itemId }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting material request item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getMaterialRequestItem(req: Request, res: Response) {
    try {
      const materialRequestItem = await (prisma as any).materialRequestItem.findUnique({
        where: { id: req.params.itemId },
        include: {
          materialRequest: true
        }
      });
      
      if (!materialRequestItem) {
        return res.status(404).json({ error: 'Material request item not found' });
      }
      
      res.json(materialRequestItem);
    } catch (error) {
      logger.error("Error getting material request item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listMaterialRequestItems(req: Request, res: Response) {
    try {
      const materialRequestItems = await (prisma as any).materialRequestItem.findMany({
        where: { materialRequestId: req.params.materialRequestId },
        include: {
          materialRequest: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(materialRequestItems);
    } catch (error) {
      logger.error("Error listing material request items:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
