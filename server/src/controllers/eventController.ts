import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const eventController = {
  async createEvent(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const event = await prisma.event.create({
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
      
      res.status(201).json(event);
    } catch (error) {
      logger.error("Error creating event:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listEvents(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Get userId from query params or fall back to authenticated user
      const { userId } = req.query;
      const targetUserId = userId ? userId as string : user.id;

      // Only allow users to access their own events unless they're admin
      if (targetUserId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const events = await prisma.event.findMany({
        where: {
          createdById: targetUserId
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
          date: 'asc'
        }
      });
      
      res.json(events);
    } catch (error) {
      logger.error("Error listing events:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getEvent(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const event = await prisma.event.findFirst({
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
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      logger.error("Error getting event:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateEvent(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const event = await prisma.event.findFirst({
        where: {
          id: req.params.id,
          createdById: user.id
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const updatedEvent = await prisma.event.update({
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
      
      res.json(updatedEvent);
    } catch (error) {
      logger.error("Error updating event:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteEvent(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const event = await prisma.event.findFirst({
        where: {
          id: req.params.id,
          createdById: user.id
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      await prisma.event.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting event:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get events by date range for calendar view
  async getEventsByDateRange(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const events = await prisma.event.findMany({
        where: {
          createdById: user.id,
          date: {
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
          date: 'asc'
        }
      });
      
      res.json(events);
    } catch (error) {
      logger.error("Error getting events by date range:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
