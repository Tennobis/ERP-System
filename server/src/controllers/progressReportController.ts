import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const progressReportController = {
  // DPR CRUD Operations
  async createDPR(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.params.userId;
      const {
        dprNo,
        date,
        projectName,
        developer,
        contractor,
        pmc,
        weatherCondition,
        majorHindrances,
        actionTaken,
        workItems,
        resources,
        remarks,
        manpowerItems,
        staffItems
      } = req.body;

      // Validate required fields
      if (!dprNo || !date || !projectName) {
        return res.status(400).json({
          message: "Missing required fields: dprNo, date, projectName"
        });
      }

      const dpr = await (prisma as any).dailyProgressReport.create({
        data: {
          dprNo,
          date: new Date(date),
          projectName,
          developer,
          contractor,
          pmc,
          weatherCondition,
          majorHindrances,
          actionTaken,
          userId,
          // Create nested work items
          workItems: {
            create: (workItems || []).map((item: any) => ({
              slNo: item.slNo,
              category: item.category,
              description: item.description,
              unit: item.unit,
              boqQuantity: parseFloat(item.boqQuantity),
              alreadyExecuted: parseFloat(item.alreadyExecuted),
              todaysProgram: parseFloat(item.todaysProgram),
              yesterdayAchievement: parseFloat(item.yesterdayAchievement),
              cumulativeQuantity: parseFloat(item.cumulativeQuantity),
              balanceQuantity: parseFloat(item.balanceQuantity),
              remarks: item.remarks
            }))
          },
          // Create nested resources
          resources: {
            create: [
              // Existing resources
              ...(resources || []).map((res: any) => ({
                resourceType: res.resourceType,
                name: res.name,
                actualCount: res.actualCount,
                plannedCount: res.plannedCount,
                availability: res.availability,
                remarks: res.remarks
              })),
              // Manpower items
              ...(manpowerItems || [])
                .filter((item: any) => item.dailyManpowerReport)
                .map((item: any) => ({
                  resourceType: 'MANPOWER',
                  name: item.dailyManpowerReport,
                  actualCount: Math.round(item.hoursWorked || 0),
                  plannedCount: Math.round(item.plannedManpower || 0),
                  availability: 'YES',
                  remarks: item.remarks || ''
                })),
              // Equipment from manpower items
              ...(manpowerItems || [])
                .filter((item: any) => item.equipmentMachineries)
                .map((item: any) => ({
                  resourceType: 'EQUIPMENT',
                  name: item.equipmentMachineries,
                  actualCount: Math.round(item.nos || 0),
                  plannedCount: null,
                  availability: 'YES',
                  remarks: item.remarks || ''
                })),
              // Staff items
              ...(staffItems || [])
                .filter((item: any) => item.count > 0)
                .map((item: any) => ({
                  resourceType: 'STAFF',
                  name: item.position,
                  actualCount: item.count,
                  plannedCount: null,
                  availability: 'YES',
                  remarks: ''
                }))
            ]
          },
          // Create nested remarks
          remarks: {
            create: (remarks || []).map((remark: any) => ({
              category: remark.category,
              remarkText: remark.remarkText
            }))
          }
        },
        include: {
          workItems: true,
          resources: true,
          remarks: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`DPR created successfully with ID: ${dpr.id} by user: ${userId}`);
      res.status(201).json(dpr);
    } catch (error) {
      logger.error("Error creating DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDPRsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const dprs = await (prisma as any).dailyProgressReport.findMany({
        where: {
          userId
        },
        include: {
          workItems: {
            orderBy: {
              slNo: 'asc'
            }
          },
          resources: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          remarks: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      logger.info(`Retrieved ${dprs.length} DPRs for user: ${userId}`);
      res.json(dprs);
    } catch (error) {
      logger.error("Error retrieving DPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAllDPRs(req: Request, res: Response) {
    try {
      const { projectName } = req.query;

      const whereClause: any = {};

      if (projectName) {
        whereClause.projectName = {
          contains: projectName as string,
          mode: 'insensitive'
        };
      }

      const dprs = await (prisma as any).dailyProgressReport.findMany({
        where: whereClause,
        include: {
          workItems: {
            orderBy: {
              slNo: 'asc'
            }
          },
          resources: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          remarks: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      logger.info(`Retrieved ${dprs.length} DPRs`);
      res.json(dprs);
    } catch (error) {
      logger.error("Error retrieving DPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDPRById(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      const dpr = await (prisma as any).dailyProgressReport.findUnique({
        where: {
          id: dprId
        },
        include: {
          workItems: {
            orderBy: {
              slNo: 'asc'
            }
          },
          resources: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          remarks: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!dpr) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      // Check authorization - allow if user is the creator or is admin/md
      if (userId && dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      logger.info(`Retrieved DPR: ${dprId}`);
      res.json(dpr);
    } catch (error) {
      logger.error("Error retrieving DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateDPR(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        dprNo,
        date,
        projectName,
        developer,
        contractor,
        pmc,
        weatherCondition,
        majorHindrances,
        actionTaken,
        workItems,
        resources,
        remarks
      } = req.body;

      // Check if DPR exists and belongs to user
      const existingDPR = await (prisma as any).dailyProgressReport.findUnique({
        where: { id: dprId }
      });

      if (!existingDPR) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      if (existingDPR.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete old work items, resources, and remarks if updating
      await (prisma as any).dPRWorkItem.deleteMany({
        where: { dprId }
      });

      await (prisma as any).dPRResource.deleteMany({
        where: { dprId }
      });

      await (prisma as any).dPRRemark.deleteMany({
        where: { dprId }
      });

      const dpr = await (prisma as any).dailyProgressReport.update({
        where: { id: dprId },
        data: {
          ...(dprNo && { dprNo }),
          ...(date && { date: new Date(date) }),
          ...(projectName && { projectName }),
          ...(developer !== undefined && { developer }),
          ...(contractor !== undefined && { contractor }),
          ...(pmc !== undefined && { pmc }),
          ...(weatherCondition !== undefined && { weatherCondition }),
          ...(majorHindrances !== undefined && { majorHindrances }),
          ...(actionTaken !== undefined && { actionTaken }),
          // Create new work items
          ...(workItems && {
            workItems: {
              create: workItems.map((item: any) => ({
                slNo: item.slNo,
                category: item.category,
                description: item.description,
                unit: item.unit,
                boqQuantity: parseFloat(item.boqQuantity),
                alreadyExecuted: parseFloat(item.alreadyExecuted),
                todaysProgram: parseFloat(item.todaysProgram),
                yesterdayAchievement: parseFloat(item.yesterdayAchievement),
                cumulativeQuantity: parseFloat(item.cumulativeQuantity),
                balanceQuantity: parseFloat(item.balanceQuantity),
                remarks: item.remarks
              }))
            }
          }),
          // Create new resources
          ...(resources && {
            resources: {
              create: resources.map((res: any) => ({
                resourceType: res.resourceType,
                name: res.name,
                actualCount: res.actualCount,
                plannedCount: res.plannedCount,
                availability: res.availability,
                remarks: res.remarks
              }))
            }
          }),
          // Create new remarks
          ...(remarks && {
            remarks: {
              create: remarks.map((remark: any) => ({
                category: remark.category,
                remarkText: remark.remarkText
              }))
            }
          })
        },
        include: {
          workItems: {
            orderBy: {
              slNo: 'asc'
            }
          },
          resources: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          remarks: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      logger.info(`DPR updated successfully: ${dprId} by user: ${userId}`);
      res.json(dpr);
    } catch (error) {
      logger.error("Error updating DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteDPR(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const existingDPR = await (prisma as any).dailyProgressReport.findUnique({
        where: { id: dprId }
      });

      if (!existingDPR) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      if (existingDPR.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Cascade delete is handled by Prisma
      await (prisma as any).dailyProgressReport.delete({
        where: { id: dprId }
      });

      logger.info(`DPR deleted successfully: ${dprId} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting DPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Work Item operations
  async addWorkItem(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        slNo,
        category,
        description,
        unit,
        boqQuantity,
        alreadyExecuted,
        todaysProgram,
        yesterdayAchievement,
        cumulativeQuantity,
        balanceQuantity,
        remarks
      } = req.body;

      // Verify DPR exists and user has access
      const dpr = await (prisma as any).dailyProgressReport.findUnique({
        where: { id: dprId }
      });

      if (!dpr) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      if (dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const workItem = await (prisma as any).dPRWorkItem.create({
        data: {
          dprId,
          slNo,
          category,
          description,
          unit,
          boqQuantity: parseFloat(boqQuantity),
          alreadyExecuted: parseFloat(alreadyExecuted),
          todaysProgram: parseFloat(todaysProgram),
          yesterdayAchievement: parseFloat(yesterdayAchievement),
          cumulativeQuantity: parseFloat(cumulativeQuantity),
          balanceQuantity: parseFloat(balanceQuantity),
          remarks
        }
      });

      logger.info(`Work item added to DPR ${dprId}`);
      res.status(201).json(workItem);
    } catch (error) {
      logger.error("Error adding work item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateWorkItem(req: Request, res: Response) {
    try {
      const { workItemId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        slNo,
        category,
        description,
        unit,
        boqQuantity,
        alreadyExecuted,
        todaysProgram,
        yesterdayAchievement,
        cumulativeQuantity,
        balanceQuantity,
        remarks
      } = req.body;

      // Verify work item exists and user has access
      const workItem = await (prisma as any).dPRWorkItem.findUnique({
        where: { id: workItemId },
        include: { dpr: true }
      });

      if (!workItem) {
        return res.status(404).json({ error: 'Work item not found' });
      }

      if (workItem.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedWorkItem = await (prisma as any).dPRWorkItem.update({
        where: { id: workItemId },
        data: {
          ...(slNo !== undefined && { slNo }),
          ...(category && { category }),
          ...(description && { description }),
          ...(unit && { unit }),
          ...(boqQuantity !== undefined && { boqQuantity: parseFloat(boqQuantity) }),
          ...(alreadyExecuted !== undefined && { alreadyExecuted: parseFloat(alreadyExecuted) }),
          ...(todaysProgram !== undefined && { todaysProgram: parseFloat(todaysProgram) }),
          ...(yesterdayAchievement !== undefined && { yesterdayAchievement: parseFloat(yesterdayAchievement) }),
          ...(cumulativeQuantity !== undefined && { cumulativeQuantity: parseFloat(cumulativeQuantity) }),
          ...(balanceQuantity !== undefined && { balanceQuantity: parseFloat(balanceQuantity) }),
          ...(remarks !== undefined && { remarks })
        }
      });

      logger.info(`Work item ${workItemId} updated`);
      res.json(updatedWorkItem);
    } catch (error) {
      logger.error("Error updating work item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteWorkItem(req: Request, res: Response) {
    try {
      const { workItemId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const workItem = await (prisma as any).dPRWorkItem.findUnique({
        where: { id: workItemId },
        include: { dpr: true }
      });

      if (!workItem) {
        return res.status(404).json({ error: 'Work item not found' });
      }

      if (workItem.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await (prisma as any).dPRWorkItem.delete({
        where: { id: workItemId }
      });

      logger.info(`Work item ${workItemId} deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting work item:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Resource operations
  async addResource(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        resourceType,
        name,
        actualCount,
        plannedCount,
        availability,
        remarks
      } = req.body;

      if (!resourceType || !name) {
        return res.status(400).json({
          message: "Missing required fields: resourceType, name"
        });
      }

      // Verify DPR exists and user has access
      const dpr = await (prisma as any).dailyProgressReport.findUnique({
        where: { id: dprId }
      });

      if (!dpr) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      if (dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const resource = await (prisma as any).dPRResource.create({
        data: {
          dprId,
          resourceType,
          name,
          actualCount,
          plannedCount,
          availability,
          remarks
        }
      });

      logger.info(`Resource added to DPR ${dprId}`);
      res.status(201).json(resource);
    } catch (error) {
      logger.error("Error adding resource:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        resourceType,
        name,
        actualCount,
        plannedCount,
        availability,
        remarks
      } = req.body;

      const resource = await (prisma as any).dPRResource.findUnique({
        where: { id: resourceId },
        include: { dpr: true }
      });

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (resource.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedResource = await (prisma as any).dPRResource.update({
        where: { id: resourceId },
        data: {
          ...(resourceType && { resourceType }),
          ...(name && { name }),
          ...(actualCount !== undefined && { actualCount }),
          ...(plannedCount !== undefined && { plannedCount }),
          ...(availability !== undefined && { availability }),
          ...(remarks !== undefined && { remarks })
        }
      });

      logger.info(`Resource ${resourceId} updated`);
      res.json(updatedResource);
    } catch (error) {
      logger.error("Error updating resource:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const resource = await (prisma as any).dPRResource.findUnique({
        where: { id: resourceId },
        include: { dpr: true }
      });

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (resource.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await (prisma as any).dPRResource.delete({
        where: { id: resourceId }
      });

      logger.info(`Resource ${resourceId} deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting resource:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Remarks operations
  async addRemark(req: Request, res: Response) {
    try {
      const { dprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        category,
        remarkText
      } = req.body;

      if (!category) {
        return res.status(400).json({
          message: "Missing required field: category"
        });
      }

      // Verify DPR exists and user has access
      const dpr = await (prisma as any).dailyProgressReport.findUnique({
        where: { id: dprId }
      });

      if (!dpr) {
        return res.status(404).json({ error: 'DPR not found' });
      }

      if (dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const remark = await (prisma as any).dPRRemark.create({
        data: {
          dprId,
          category,
          remarkText
        }
      });

      logger.info(`Remark added to DPR ${dprId}`);
      res.status(201).json(remark);
    } catch (error) {
      logger.error("Error adding remark:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateRemark(req: Request, res: Response) {
    try {
      const { remarkId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        category,
        remarkText
      } = req.body;

      const remark = await (prisma as any).dPRRemark.findUnique({
        where: { id: remarkId },
        include: { dpr: true }
      });

      if (!remark) {
        return res.status(404).json({ error: 'Remark not found' });
      }

      if (remark.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updatedRemark = await (prisma as any).dPRRemark.update({
        where: { id: remarkId },
        data: {
          ...(category && { category }),
          ...(remarkText !== undefined && { remarkText })
        }
      });

      logger.info(`Remark ${remarkId} updated`);
      res.json(updatedRemark);
    } catch (error) {
      logger.error("Error updating remark:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteRemark(req: Request, res: Response) {
    try {
      const { remarkId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const remark = await (prisma as any).dPRRemark.findUnique({
        where: { id: remarkId },
        include: { dpr: true }
      });

      if (!remark) {
        return res.status(404).json({ error: 'Remark not found' });
      }

      if (remark.dpr.userId !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await (prisma as any).dPRRemark.delete({
        where: { id: remarkId }
      });

      logger.info(`Remark ${remarkId} deleted`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting remark:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // WPR CRUD Operations
  async createWPR(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.params.userId;
      const {
        projectId,
        weekStart,
        weekEnding,
        milestones,
        plannedProgress,
        actualProgress,
        progressRemarks,
        issues,
        risks,
        safetySummary,
        qualitySummary,
        manpower,
        equipment,
        materials,
        teamPerformance
      } = req.body;

      const wpr = await (prisma as any).weeklyProgressReport.create({
        data: {
          projectId,
          weekStart: new Date(weekStart),
          weekEnding: new Date(weekEnding),
          milestones,
          plannedProgress,
          actualProgress,
          progressRemarks,
          issues,
          risks,
          safetySummary,
          qualitySummary,
          manpower: JSON.stringify(manpower || []),
          equipment: JSON.stringify(equipment || []),
          materials: JSON.stringify(materials || []),
          teamPerformance,
          createdById: userId
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

      logger.info(`WPR created successfully with ID: ${wpr.id} by user: ${userId}`);
      res.status(201).json({
        ...wpr,
        manpower: manpower || [],
        equipment: equipment || [],
        materials: materials || []
      });
    } catch (error) {
      logger.error("Error creating WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getWPRsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { projectId } = req.query;

      const whereClause: any = {
        createdById: userId
      };

      if (projectId) {
        whereClause.projectId = projectId as string;
      }

      const wprs = await (prisma as any).weeklyProgressReport.findMany({
        where: whereClause,
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
          createdAt: 'desc'
        }
      });

      // Parse JSON fields for response
      const wprsWithParsedData = wprs.map((wpr: any) => ({
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      }));

      logger.info(`Retrieved ${wprs.length} WPRs for user: ${userId}`);
      res.json(wprsWithParsedData);
    } catch (error) {
      logger.error("Error retrieving WPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getAllWPRs(req: Request, res: Response) {
    try {
      const { projectId } = req.query;

      const whereClause: any = {};

      if (projectId) {
        whereClause.projectId = projectId as string;
      }

      const wprs = await (prisma as any).weeklyProgressReport.findMany({
        where: whereClause,
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
          createdAt: 'desc'
        }
      });

      // Parse JSON fields for response
      const wprsWithParsedData = wprs.map((wpr: any) => ({
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      }));

      logger.info(`Retrieved ${wprs.length} WPRs`);
      res.json(wprsWithParsedData);
    } catch (error) {
      logger.error("Error retrieving WPRs:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getWPRById(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const wpr = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
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

      if (!wpr) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      // Parse JSON fields for response
      const wprWithParsedData = {
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      };

      logger.info(`Retrieved WPR: ${wprId} for user: ${userId}`);
      res.json(wprWithParsedData);
    } catch (error) {
      logger.error("Error retrieving WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateWPR(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        weekStart,
        weekEnding,
        milestones,
        plannedProgress,
        actualProgress,
        progressRemarks,
        issues,
        risks,
        safetySummary,
        qualitySummary,
        manpower,
        equipment,
        materials,
        teamPerformance
      } = req.body;

      // First check if the WPR exists and belongs to the user
      const existingWPR = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
        }
      });

      if (!existingWPR) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      const wpr = await (prisma as any).weeklyProgressReport.update({
        where: {
          id: wprId
        },
        data: {
          ...(weekStart && { weekStart: new Date(weekStart) }),
          ...(weekEnding && { weekEnding: new Date(weekEnding) }),
          ...(milestones && { milestones }),
          ...(plannedProgress && { plannedProgress }),
          ...(actualProgress && { actualProgress }),
          ...(progressRemarks !== undefined && { progressRemarks }),
          ...(issues !== undefined && { issues }),
          ...(risks !== undefined && { risks }),
          ...(safetySummary !== undefined && { safetySummary }),
          ...(qualitySummary !== undefined && { qualitySummary }),
          ...(manpower && { manpower: JSON.stringify(manpower) }),
          ...(equipment && { equipment: JSON.stringify(equipment) }),
          ...(materials && { materials: JSON.stringify(materials) }),
          ...(teamPerformance !== undefined && { teamPerformance })
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

      // Parse JSON fields for response
      const wprWithParsedData = {
        ...wpr,
        manpower: wpr.manpower ? JSON.parse(wpr.manpower) : [],
        equipment: wpr.equipment ? JSON.parse(wpr.equipment) : [],
        materials: wpr.materials ? JSON.parse(wpr.materials) : []
      };

      logger.info(`WPR updated successfully: ${wprId} by user: ${userId}`);
      res.json(wprWithParsedData);
    } catch (error) {
      logger.error("Error updating WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteWPR(req: Request, res: Response) {
    try {
      const { wprId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First check if the WPR exists and belongs to the user
      const existingWPR = await (prisma as any).weeklyProgressReport.findFirst({
        where: {
          id: wprId,
          createdById: userId
        }
      });

      if (!existingWPR) {
        return res.status(404).json({ error: 'WPR not found or unauthorized' });
      }

      await (prisma as any).weeklyProgressReport.delete({
        where: {
          id: wprId
        }
      });

      logger.info(`WPR deleted successfully: ${wprId} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting WPR:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
