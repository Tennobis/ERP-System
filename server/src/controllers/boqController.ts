import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const boqController = {
  async createBOQ(req: Request, res: Response) {
    try {
      const { projectId, userId, ...boqData} = req.body;
      
      logger.info("Creating BOQ with data:", { projectId, userId, boqData, userFromToken: req.user?.id });
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const boq = await prisma.bOQ.create({
        data: {
          ...boqData,
          projectId,
          createdById: req.user?.id
        },
        include: {
          project: {
            include: {
              client: true
            }
          },
          createdBy: true
        }
      });

      res.status(201).json(boq);
    } catch (error) {
      logger.error("Error creating BOQ:", error);
      logger.error("Request body:", req.body);
      logger.error("User from token:", req.user?.id);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listBOQs(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (userId) {
        const boqs = await prisma.bOQ.findMany({
          where: {
            createdById: userId as string
          },
          include: {
            project: {
              include: {
                client: true
              }
            },
            createdBy: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
  
        res.json(boqs);
      } else{
        const boqs = await prisma.bOQ.findMany({
         
          include: {
            project: {
              include: {
                client: true
              }
            },
            createdBy: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
  
        res.json(boqs);

      }
      
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const boq = await prisma.bOQ.findFirst({
        where: { 
          id: req.params.id,
          createdById: userId as string
        },
        include: {
          project: {
            include: {
              client: true
            }
          },
          createdBy: true
        }
      });
      
      if (!boq) {
        return res.status(404).json({ error: 'BOQ not found' });
      }
      
      res.json(boq);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // First check if BOQ exists and belongs to user
      const existingBoq = await prisma.bOQ.findFirst({
        where: {
          id: req.params.id,
          createdById: userId as string
        }
      });

      if (!existingBoq) {
        return res.status(404).json({ error: 'BOQ not found or unauthorized' });
      }

      const boq = await prisma.bOQ.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          project: true,
          createdBy: true
        }
      });

      res.json(boq);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteBOQ(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      logger.info("Deleting BOQ:", { boqId: req.params.id, userId, userFromToken: req.user?.id });
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // First check if BOQ exists
      const existingBoq = await prisma.bOQ.findUnique({
        where: { id: req.params.id },
        include: {
          project: { include: { client: true } },
          createdBy: true
        }
      });

      if (!existingBoq) {
        return res.status(404).json({ error: 'BOQ not found' });
      }

      // Admin can delete any BOQ, others can only delete their own
      const userRole = req.user?.role;
      const isAdmin = userRole === 'admin';
      const isOwner = existingBoq.createdById === userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'You can only delete BOQs you created' });
      }

      logger.info("Deleting BOQ:", { name: existingBoq.names, project: existingBoq.project.name });

      await prisma.bOQ.delete({
        where: { id: req.params.id }
      });

      logger.info("BOQ deleted successfully:", { boqId: req.params.id });
      res.status(200).json({ 
        message: "BOQ deleted successfully",
        deletedBOQ: {
          id: existingBoq.id,
          name: existingBoq.names,
          project: existingBoq.project.name
        }
      });
    } catch (error) {
      logger.error("Error deleting BOQ:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
