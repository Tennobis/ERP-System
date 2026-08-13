import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const milestoneController = {
  async createMilestone(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { name, startDate, endDate } = req.body;

      const milestone = await prisma.projectMilestone.create({
        data: {
          projectId,
          name,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null
        }
      });

      res.status(201).json(milestone);
    } catch (error) {
      logger.error("Error creating milestone:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listMilestones(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      
      const milestones = await prisma.projectMilestone.findMany({
        where: { projectId },
        orderBy: { startDate: 'asc' }
      });

      res.json(milestones);
    } catch (error) {
      logger.error("Error listing milestones:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getMilestone(req: Request, res: Response) {
    try {
      const { milestoneId } = req.params;

      const milestone = await prisma.projectMilestone.findUnique({
        where: { id: milestoneId },
        include: { project: true }
      });

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json(milestone);
    } catch (error) {
      logger.error("Error getting milestone:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateMilestone(req: Request, res: Response) {
    try {
      const { milestoneId } = req.params;
      const { name, startDate, endDate } = req.body;

      const milestone = await prisma.projectMilestone.update({
        where: { id: milestoneId },
        data: {
          ...(name && { name }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
        }
      });

      res.json(milestone);
    } catch (error) {
      logger.error("Error updating milestone:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteMilestone(req: Request, res: Response) {
    try {
      const { milestoneId } = req.params;

      await prisma.projectMilestone.delete({
        where: { id: milestoneId }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting milestone:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createMultipleMilestones(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { milestones } = req.body;

      if (!milestones || !Array.isArray(milestones)) {
        return res.status(400).json({ error: 'Milestones array is required' });
      }

      const createdMilestones = await prisma.$transaction(
        milestones.map((milestone: any) => 
          prisma.projectMilestone.create({
            data: {
              projectId,
              name: milestone.name,
              startDate: new Date(milestone.startDate),
              endDate: milestone.endDate ? new Date(milestone.endDate) : null
            }
          })
        )
      );

      res.status(201).json(createdMilestones);
    } catch (error) {
      logger.error("Error creating multiple milestones:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
