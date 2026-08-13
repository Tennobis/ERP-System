import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const tenderController = {
  async createTender(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const tenderData = {
        ...req.body,
        createdById: userId,
        submissionDate: req.body.submissionDate ? new Date(req.body.submissionDate) : new Date()
      };

      const tender = await prisma.tender.create({
        data: tenderData,
        include: {
          requirements: true,
          client: true,
          Project: true,
          createdBy: true
        }
      });

      const clientManagers = await prisma.user.findMany({ where: { role: 'client_manager' } });
      await Promise.all(clientManagers.map(manager =>
        prismaNotificationService.createNotification({
          to: manager.id,
          type: 'tender',
          message: `A new tender has been created.`
        })
      ));

      res.status(201).json(tender);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listTenders(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if(userId){

        const tenders = await prisma.tender.findMany({
          where: {
            createdById: userId as string
          },
          include: {
            requirements: true,
            client: true,
            Project: true,
            createdBy: true,
            bids: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
  
        res.json(tenders);
      } else{
        const tenders = await prisma.tender.findMany({
          // where: {
          //   createdById: userId as string
          // },
          include: {
            requirements: true,
            client: true,
            Project: true,
            createdBy: true,
            bids: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
  
        res.json(tenders);
      }
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTender(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      const tender = await prisma.tender.findFirst({
        where: {
          id: req.params.id,
          createdById: userId as string
        },
        include: {
          requirements: true,
          client: true,
          Project: true,
          createdBy: true,
          bids: true
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      res.json(tender);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTender(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const updateData = {
        ...req.body,
        ...(req.body.submissionDate && { submissionDate: new Date(req.body.submissionDate) })
      };

      const tender = await prisma.tender.updateMany({
        where: {
          id: req.params.id,
          createdById: userId as string
        },
        data: updateData
      });

      if (tender.count === 0) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const updatedTender = await prisma.tender.findUnique({
        where: { id: req.params.id },
        include: {
          requirements: true,
          client: true,
          Project: true,
          createdBy: true,
          bids: true
        }
      });

      res.json(updatedTender);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTender(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      const deletedTender = await prisma.tender.deleteMany({
        where: {
          id: req.params.id,
          createdById: userId as string
        }
      });

      if (deletedTender.count === 0) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createTenderRequirement(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { tenderId } = req.params;

      const tender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          createdById: userId as string
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const requirement = await prisma.tenderRequirement.create({
        data: {
          ...req.body,
          tenderId
        },
        include: {
          tender: true
        }
      });

      res.status(201).json(requirement);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listTenderRequirements(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { tenderId } = req.params;

      const tender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          createdById: userId as string
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const requirements = await prisma.tenderRequirement.findMany({
        where: { tenderId },
        include: {
          tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(requirements);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTenderRequirement(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { tenderId, requirementId } = req.params;

      const tender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          createdById: userId as string
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const requirement = await prisma.tenderRequirement.findFirst({
        where: {
          id: requirementId,
          tenderId
        },
        include: {
          tender: true
        }
      });

      if (!requirement) {
        return res.status(404).json({ error: 'Requirement not found' });
      }

      res.json(requirement);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTenderRequirement(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { tenderId, requirementId } = req.params;

      const tender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          createdById: userId as string
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const requirement = await prisma.tenderRequirement.updateMany({
        where: {
          id: requirementId,
          tenderId
        },
        data: req.body
      });

      if (requirement.count === 0) {
        return res.status(404).json({ error: 'Requirement not found' });
      }

      const updatedRequirement = await prisma.tenderRequirement.findUnique({
        where: { id: requirementId },
        include: {
          tender: true
        }
      });

      res.json(updatedRequirement);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTenderRequirement(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const { tenderId, requirementId } = req.params;

      const tender = await prisma.tender.findFirst({
        where: {
          id: tenderId,
          createdById: userId as string
        }
      });

      if (!tender) {
        return res.status(404).json({ error: 'Tender not found' });
      }

      const deletedRequirement = await prisma.tenderRequirement.deleteMany({
        where: {
          id: requirementId,
          tenderId
        }
      });

      if (deletedRequirement.count === 0) {
        return res.status(404).json({ error: 'Requirement not found' });
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Bid endpoints
  async createBid(req: Request, res: Response) {
    try {
      const bid = await prisma.bid.create({
        data: {
          ...req.body,
          tenderId: req.params.id
        },
        include: {
          tender: true
        }
      });

      const tender = await prisma.tender.findUnique({ where: { id: req.params.id } });
      if (tender && tender.projectId) {
        const project = await prisma.project.findUnique({ where: { id: tender.projectId } });
        if (project && project.clientId) {
          await prismaNotificationService.createNotification({
            to: project.clientId,
            type: 'bid',
            message: `A new bid has been submitted to your tender.`
          });
        }
      }

      res.status(201).json(bid);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listBids(req: Request, res: Response) {
    try {
      const bids = await prisma.bid.findMany({
        where: { tenderId: req.params.id },
        include: {
          tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(bids);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateBid(req: Request, res: Response) {
    try {
      const bid = await prisma.bid.update({
        where: { id: req.params.bidId },
        data: req.body,
        include: {
          tender: true
        }
      });

      res.json(bid);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 