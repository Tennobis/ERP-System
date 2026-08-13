import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

// Type assertion to work around Prisma client generation issues
const prismaClient = prisma as any;

export const issueReportController = {
  async createIssueReport(req: Request, res: Response) {
    try {
      const {
        title,
        type,
        priority,
        reportedBy,
        description,
        location,
        createdById,
        assignedToId,
        estimatedResolutionTime
      } = req.body;

      if (!title || !reportedBy || !description || !location || !createdById) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "title, reportedBy, description, location, and createdById are required"
        });
      }

      const issueReport = await prismaClient.issueReport.create({
        data: {
          title,
          type: type || 'OTHER',
          priority: priority || 'MEDIUM',
          reportedBy,
          description,
          location,
          createdById,
          assignedToId,
          estimatedResolutionTime
        },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(201).json(issueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAllIssueReports(req: Request, res: Response) {
    try {
      const { status, priority, type, assignedToId } = req.query;

      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (type) where.type = type;
      if (assignedToId) where.assignedToId = assignedToId;

      const issueReports = await prismaClient.issueReport.findMany({
        where,
        include: {
          assignedTo: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json(issueReports);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getIssueReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const issueReport = await prismaClient.issueReport.findUnique({
        where: { id },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      if (!issueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      res.status(200).json(issueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateIssueReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        type,
        priority,
        description,
        location,
        assignedToId,
        estimatedResolutionTime,
        actualResolutionTime
      } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      const updatedIssueReport = await prismaClient.issueReport.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(type && { type }),
          ...(priority && { priority }),
          ...(description && { description }),
          ...(location && { location }),
          ...(assignedToId !== undefined && { assignedToId }),
          ...(estimatedResolutionTime !== undefined && { estimatedResolutionTime }),
          ...(actualResolutionTime !== undefined && { actualResolutionTime })
        },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(200).json(updatedIssueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteIssueReport(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      await prismaClient.issueReport.delete({
        where: { id }
      });

      res.status(200).json({
        message: "Issue report deleted successfully",
        deletedId: id
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateIssueStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          message: "Missing required fields",
          error: "Issue report ID and status are required"
        });
      }

      const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
          error: "Status must be one of: OPEN, IN_PROGRESS, RESOLVED"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      const updatedIssueReport = await prismaClient.issueReport.update({
        where: { id },
        data: { status },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(200).json(updatedIssueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async assignIssue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { assignedToId } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      if (assignedToId) {
        const assignedUser = await prismaClient.user.findUnique({
          where: { id: assignedToId }
        });

        if (!assignedUser) {
          return res.status(404).json({
            message: "Assigned user not found",
            error: "No user found with the provided assignedToId"
          });
        }
      }

      const updatedIssueReport = await prismaClient.issueReport.update({
        where: { id },
        data: { assignedToId },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(200).json(updatedIssueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async startResolution(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      const updatedIssueReport = await prismaClient.issueReport.update({
        where: { id },
        data: {
          isStartResolution: true,
          startResolutionAt: new Date(),
          status: 'IN_PROGRESS'
        },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(200).json(updatedIssueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async markResolved(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "Missing required parameter",
          error: "Issue report ID is required"
        });
      }

      const existingIssueReport = await prismaClient.issueReport.findUnique({
        where: { id }
      });

      if (!existingIssueReport) {
        return res.status(404).json({
          message: "Issue report not found",
          error: "No issue report found with the provided ID"
        });
      }

      const markedResolvedAt = new Date();
      let actualResolutionTime = null;

      // Calculate actual resolution time if start resolution was marked
      if (existingIssueReport.startResolutionAt) {
        const timeDiffMs = markedResolvedAt.getTime() - existingIssueReport.startResolutionAt.getTime();
        actualResolutionTime = timeDiffMs / (1000 * 60 * 60); // Convert to hours
      }

      const updatedIssueReport = await prismaClient.issueReport.update({
        where: { id },
        data: {
          isMarkedResolved: true,
          markedResolvedAt,
          status: 'RESOLVED',
          actualResolutionTime
        },
        include: {
          assignedTo: true,
          createdBy: true
        }
      });

      res.status(200).json(updatedIssueReport);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
