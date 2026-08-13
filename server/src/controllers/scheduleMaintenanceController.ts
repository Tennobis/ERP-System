import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const scheduleMaintenanceController = {
  async createScheduleMaintenance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scheduleMaintenance = await prisma.scheduleMaintenance.create({
        data: {
          ...req.body,
          createdById: user.id
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(scheduleMaintenance);
    } catch (error) {
      logger.error("Error creating schedule maintenance:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listScheduleMaintenances(req: Request, res: Response) {
    try {
      // Get userId from query params or fall back to authenticated user
      const { userId } = req.query;
      if(userId){
        const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        where: {
          createdById: userId as string 
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      res.json(scheduleMaintenances);
      }else {
        const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        where: {
          // createdById: userId as string 
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      res.json(scheduleMaintenances);
      }
      // Only allow users to access their own schedule maintenances unless they're admin
      
    } catch (error) {
      logger.error("Error listing schedule maintenances:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async globalListScheduleMaintenances(req:Request , res:Response){
    try {
      const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        include:{
          createdBy:{
            select:{
              id:true,
              name:true,
              email:true
            }
          }
        }
      })
      res.json(scheduleMaintenances)
    } catch (error) {
       logger.error("Error getting schedule maintenance:", error);
        res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getScheduleMaintenance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scheduleMaintenance = await prisma.scheduleMaintenance.findFirst({
        where: {
          id: req.params.id,
          createdById: user.id
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (!scheduleMaintenance) {
        return res.status(404).json({ error: 'Schedule maintenance not found' });
      }
      
      res.json(scheduleMaintenance);
    } catch (error) {
      logger.error("Error getting schedule maintenance:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateScheduleMaintenance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scheduleMaintenance = await prisma.scheduleMaintenance.findFirst({
        where: {
          id: req.params.id,
          createdById: user.id
        }
      });

      if (!scheduleMaintenance) {
        return res.status(404).json({ error: 'Schedule maintenance not found' });
      }

      const updatedScheduleMaintenance = await prisma.scheduleMaintenance.update({
        where: { id: req.params.id },
        data: req.body,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      res.json(updatedScheduleMaintenance);
    } catch (error) {
      logger.error("Error updating schedule maintenance:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteScheduleMaintenance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const scheduleMaintenance = await prisma.scheduleMaintenance.findFirst({
        where: {
          id: req.params.id,
          createdById: user.id
        }
      });

      if (!scheduleMaintenance) {
        return res.status(404).json({ error: 'Schedule maintenance not found' });
      }

      await prisma.scheduleMaintenance.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting schedule maintenance:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get schedule maintenances by date range
  async getScheduleMaintenancesByDateRange(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        where: {
          createdById: user.id,
          scheduledDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string)
          }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      res.json(scheduleMaintenances);
    } catch (error) {
      logger.error("Error getting schedule maintenances by date range:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get schedule maintenances by priority
  async getScheduleMaintenancesByPriority(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { priority } = req.params;

      const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        where: {
          createdById: user.id,
          Priority: priority as any
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      res.json(scheduleMaintenances);
    } catch (error) {
      logger.error("Error getting schedule maintenances by priority:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get schedule maintenances by maintenance type
  async getScheduleMaintenancesByType(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { type } = req.params;

      const scheduleMaintenances = await prisma.scheduleMaintenance.findMany({
        where: {
          createdById: user.id,
          maintenanceType: type as any
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      res.json(scheduleMaintenances);
    } catch (error) {
      logger.error("Error getting schedule maintenances by type:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
