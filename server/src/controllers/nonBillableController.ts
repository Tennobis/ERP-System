import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const nonBillableController = {
  async createNonBillable(req: Request, res: Response) {
    try {
      const { name, amount, description, projectId } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      } 

      // Verify project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const nonBillable = await (prisma as any).nonBillable.create({
        data: {
          projectId,
          name: name || 'Unnamed Expense',
          amount: parseFloat(amount) || 0,
          description: description || '',
          createdBy: req.user.id
        },
        include: {
          project: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Send notification to project managers
      // if (project) {
      //   const projectWithManagers = await prisma.project.findUnique({
      //     where: { id: projectId },
      //     include: { managers: true }
      //   });

      //   if (projectWithManagers?.managers && projectWithManagers.managers.length > 0) {
      //     await Promise.all(projectWithManagers.managers.map((manager: any) =>
      //       prismaNotificationService.createNotification({
      //         to: manager.id,
      //         type: 'project',
      //         message: `A new expense "${nonBillable.name}" has been added to project ${project.name}.`
      //       })
      //     ));
      //   }
      // }
      
      res.status(201).json(nonBillable);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listNonBillables(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      
      const whereCondition = projectId ? { projectId: projectId as string } : {};
      
      const nonBillables = await (prisma as any).nonBillable.findMany({
        where: whereCondition,
        include: {
          project: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(nonBillables);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getNonBillable(req: Request, res: Response) {
    try {
      const nonBillable = await (prisma as any).nonBillable.findUnique({
        where: { id: req.params.id },
        include: {
          project: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (!nonBillable) {
        return res.status(404).json({ error: 'Non-billable item not found' });
      }
      
      res.json(nonBillable);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateNonBillable(req: Request, res: Response) {
    try {
      const { name, amount, description } = req.body;

      const nonBillable = await (prisma as any).nonBillable.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(description !== undefined && { description })
        },
        include: {
          project: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      res.json(nonBillable);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Non-billable item not found' });
      }
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteNonBillable(req: Request, res: Response) {
    try {
      await (prisma as any).nonBillable.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Non-billable item not found' });
      }
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get non-billables for labor wages (filtered by name pattern or type)
  async getLabourWages(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      
      const whereCondition: any = {
        name: {
          contains: 'labor',
          mode: 'insensitive'
        }
      };
      
      if (projectId) {
        whereCondition.projectId = projectId as string;
      }
      
      const labourWages = await (prisma as any).nonBillable.findMany({
        where: whereCondition,
        include: {
          project: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(labourWages);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
