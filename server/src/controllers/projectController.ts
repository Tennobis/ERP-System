import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { randomUUID } from 'crypto';



export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, clientId, startDate, milestones, ...projectData } = req.body;
      
      const project = await prisma.project.create({
        data: {
          ...projectData,
          name,
          clientId,
          startDate: startDate ? new Date(startDate) : new Date(),
          createdById: userId
        }
      });

      // Create milestones if provided
      if (milestones && Array.isArray(milestones) && milestones.length > 0) {
        await prisma.$transaction(
          milestones.map((milestone: any) => 
            prisma.projectMilestone.create({
              data: {
                projectId: project.id,
                name: milestone.name,
                startDate: new Date(milestone.startDate),
                endDate: milestone.endDate ? new Date(milestone.endDate) : null
              }
            })
          )
        );
      }

      // Return project with milestones
      const projectWithMilestones = await prisma.project.findUnique({
        where: { id: project.id },
        include: { milestones: true }
      });
      
      res.status(201).json(projectWithMilestones);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listProjects(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          nonBillables: true,
          Tender: true,
          milestones: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProject(req: Request, res: Response) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          client: true,
          managers: true,
          members: true,
          // tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          milestones: true
        }
      });
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateProject(req: Request, res: Response) {
    try {
      const { milestones, ...projectData } = req.body;
      
      const project = await prisma.project.update({
        where: { id: req.params.id },
        data: {
          ...projectData,
          ...(milestones && {
            milestones: {
              deleteMany: {},
              create: milestones.map((milestone: any) => ({
                name: milestone.name,
                startDate: new Date(milestone.startDate).toISOString(),
                endDate: new Date(milestone.endDate).toISOString()
              }))
            }
          })
        },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true,
          Payment: true,
          milestones: true
        }
      });
      
      res.json(project);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteProject(req: Request, res: Response) {
    try {
      await prisma.project.delete({
        where: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Task CRUD Operations
  async createTask(req: Request, res: Response) {
    try {
       const { userId } = req.params;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Log the request data for debugging
      logger.info("Creating task with data:", {
        body: req.body,
        projectId: req.body.projectId,
        userId: userId
      });

      // Prepare the data object explicitly
      const taskData = {
        name: req.body.name,
        description: req.body.description || null,
        assignedToId: req.body.assignedToId || null,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        status: req.body.status || "pending",
        projectId: req.body.projectId,
        createdById: userId
      };

      // Log the prepared task data
      logger.info("Prepared task data:", taskData);

      const task = await prisma.task.create({
        data: taskData,
        include: {
          project: true,
          assignedTo: true
        }
      });
      
      // If task was assigned to someone, send them a notification
      if (task.assignedToId) {
        try {
          await prismaNotificationService.createNotification({
            to: task.assignedToId,
            type: 'task',
            message: `A new task has been assigned to you: ${task.name}`
          });
        } catch (notifError) {
          // Log notification error but don't fail the request
          logger.error("Error sending notification:", notifError);
        }
      }
      
      res.status(201).json(task);
    } catch (error) {
      // Log the full error for debugging
      logger.error("Error creating task:", {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : "Unknown error"
      });

      // Send a more detailed error response
      return res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async listTasks(req: Request, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        where: { createdById: req.params.userId },
        include: {
          project: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(tasks);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTask(req: Request, res: Response) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: req.params.taskId },
        include: {
          project: true
        }
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateTask(req: Request, res: Response) {
    const { userId } =req.params
    try {
      // Format dates properly for Prisma
      const updateData = { ...req.body };
      if (updateData.dueDate && typeof updateData.dueDate === 'string') {
        updateData.dueDate = new Date(updateData.dueDate);
      }
      if (updateData.startDate && typeof updateData.startDate === 'string') {
        updateData.startDate = new Date(updateData.startDate);
      }
      // Convert status from frontend format to enum format
      if (updateData.status === 'in-progress') {
        updateData.status = 'in_progress';
      }

      const task = await prisma.task.update({
        where: { id: req.params.taskId ,
          createdById : userId 
        },
        data: updateData,
        include: {
          project: true,
        }
      });
      
      res.json(task);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      await prisma.task.delete({
        where: { id: req.params.taskId }
      });
      
      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Project-specific operations
  async getProjectsByClient(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: { clientId: req.params.clientId },
        include: {
          client: true,
          managers: true,
          members: true,
          // tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectsByManager(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          managerId: req.params.managerId
        },
        include: {
          client: true,
          managers: true,
          members: true,
          // tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectsByMember(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              id: req.params.memberId
            }
          }
        },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          Tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const projects = await prisma.project.findMany({
        where: {
          createdById: userId
        },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          nonBillables: true,
          Tender: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(projects);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getTasksByAssignee(req: Request, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        where: { assignedToId: req.params.assigneeId },
        include: {
          project: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(tasks);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getProjectActivity(req: Request, res: Response) {
    try {
      // For now, return some mock activity data
      // You can implement actual activity tracking later
      const activityData = [
        { name: 'Residential Complex A', data: [0.8, 0.6, 0.9, 0.7, 0.5, 0.3, 0.1] },
        { name: 'Office Tower B', data: [0.4, 0.7, 0.3, 0.8, 0.6, 0.2, 0.0] },
        { name: 'Shopping Mall C', data: [0.9, 0.8, 0.7, 0.6, 0.8, 0.4, 0.2] },
        { name: 'Luxury Villas', data: [0.2, 0.1, 0.3, 0.2, 0.1, 0.0, 0.0] },
        { name: 'Industrial Complex', data: [0.5, 0.4, 0.2, 0.1, 0.3, 0.0, 0.0] }
      ];
      
      res.json(activityData);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Non-billable management endpoints
  async addNonBillable(req: Request, res: Response) {
    try {
      const { name, amount, description } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Verify project exists
      const project = await prisma.project.findUnique({
        where: { id: req.params.id }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Create new non-billable entry
      const newNonBillable = await (prisma as any).nonBillable.create({
        data: {
          projectId: req.params.id,
          name: name || 'Unnamed Expense',
          amount: parseFloat(amount) || 0,
          description: description || '',
          createdBy: req.user.id
        },
        include: {
          project: true,
          creator: true
        }
      });

      // Recalculate total spend for the project
      await recalculateProjectTotalSpend(req.params.id);

      // Get updated project with all relations
      const updatedProject = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          nonBillables: {
            include: {
              creator: true
            }
          },
          Tender: true
        } as any
      }) as any;

      // Send notification to project managers
      if (updatedProject?.managers && updatedProject.managers.length > 0) {
        await Promise.all(updatedProject.managers.map((manager: any) =>
          prismaNotificationService.createNotification({
            to: manager.id,
            type: 'project',
            message: `A new non-billable expense "${newNonBillable.name}" has been added to project ${updatedProject.name}.`
          })
        ));
      }

      res.status(201).json(newNonBillable);
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
      const { nonBillableId } = req.params;
      const { name, amount, description } = req.body;

      // Update the specific non-billable
      const updatedNonBillable = await (prisma as any).nonBillable.update({
        where: { 
          id: nonBillableId,
          projectId: req.params.id // Ensure it belongs to the project
        },
        data: {
          ...(name && { name }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(description !== undefined && { description })
        },
        include: {
          project: true,
          creator: true
        }
      });

      // Recalculate total spend for the project
      await recalculateProjectTotalSpend(req.params.id);

      res.json(updatedNonBillable);
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
      const { nonBillableId } = req.params;

      // Delete the specific non-billable
      await (prisma as any).nonBillable.delete({
        where: { 
          id: nonBillableId,
          projectId: req.params.id // Ensure it belongs to the project
        }
      });

      // Recalculate total spend for the project
      await recalculateProjectTotalSpend(req.params.id);

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

  async listNonBillables(req: Request, res: Response) {
    try {
      const nonBillables = await (prisma as any).nonBillable.findMany({
        where: { projectId: req.params.id },
        include: {
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

  async recalculateTotalSpend(req: Request, res: Response) {
    try {
      // Use the helper function to recalculate
      await recalculateProjectTotalSpend(req.params.id);

      // Get updated project with all relations
      const updatedProject = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          nonBillables: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          Tender: true
        } as any
      });

      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(updatedProject);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateSpent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }

      // Get current project to check existing totalSpend
      const currentProject = await prisma.project.findUnique({
        where: { id },
        select: { totalSpend: true }
      });

      if (!currentProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Calculate new total spent
      const currentTotalSpend = currentProject.totalSpend || 0;
      const newTotalSpend = currentTotalSpend + amount;

      // Update project with new total spent
      const updatedProject = await prisma.project.update({
        where: { id },
        data: { totalSpend: newTotalSpend },
        include: {
          client: true,
          managers: true,
          members: true,
          tasks: true,
          invoices: true,
          materialRequests: true,
          nonBillables: true,
          Tender: true
        } as any
      });

      res.json({
        message: 'Project spent updated successfully',
        project: updatedProject,
        previousTotalSpend: currentTotalSpend,
        newTotalSpend: newTotalSpend,
        amountAdded: amount
      });
      // logger.success("Project spent updated successfully");
    } catch (error) {
      logger.error("Error updating project spent:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listAllTasks(req: Request, res: Response) {
    console.log("listAllTasks endpoint hit");
    try {
      const tasks = await prisma.task.findMany({
        include: {
          project: true,
          assignedTo: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(tasks);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

  }
};

export const recalculateProjectTotalSpend = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { 
      nonBillables: true,
      invoices: true 
    } as any
  }) as any;

  if (!project) return;

  const nonBillableTotal = project.nonBillables?.reduce((sum: number, nb: any) => sum + parseFloat(nb.amount || 0), 0) || 0;
  const invoiceTotal = project.invoices?.reduce((sum: number, invoice: any) => sum + parseFloat(invoice.total || 0), 0) || 0;
  const totalSpend = nonBillableTotal + invoiceTotal;

  await prisma.project.update({
    where: { id: projectId },
    data: { totalSpend } as any
  });
}; 