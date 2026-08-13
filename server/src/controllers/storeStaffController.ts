import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { StaffPosition, StaffStatus, StaffShift } from '@prisma/client';
import { prismaNotificationService } from '../services/prismaNotificationService';

// Type assertion to work around Prisma client generation issues
const prismaClient = prisma as any;

export const storeStaffController = {
  async createStoreStaff(req: Request, res: Response) {
    try {
      const {
        fullName,
        email,
        contactNumber,
        emergencyContact,
        address,
        position,
        experienceYears,
        availabilityStatus,
        shiftTiming,
        joiningDate,
        status = 'OFF_DUTY',
        certifications,
        areaOfSpecialization,
        notes,
        createdById
      } = req.body;

      // Validate required fields
      if (!fullName || !email || !contactNumber || !address || !position || !experienceYears || !availabilityStatus || !shiftTiming || !joiningDate || !createdById) {
        logger.error('StoreStaff creation failed: Missing required fields');
        return res.status(400).json({
          message: "Missing required fields",
          error: "fullName, email, contactNumber, address, position, experienceYears, availabilityStatus, shiftTiming, joiningDate, and createdById are required"
        });
      }

      // Validate enum values
      const validPositions = Object.values(StaffPosition);
      const validStatuses = Object.values(StaffStatus);
      const validShifts = Object.values(StaffShift);
      const validActiveStatuses = ['OFF_DUTY', 'ON_DUTY'];

      if (!validPositions.includes(position)) {
        logger.error(`Invalid position: ${position}`);
        return res.status(400).json({ 
          message: "Invalid position", 
          error: `Position must be one of: ${validPositions.join(', ')}` 
        });
      }

      if (!validStatuses.includes(availabilityStatus)) {
        logger.error(`Invalid availability status: ${availabilityStatus}`);
        return res.status(400).json({ 
          message: "Invalid availability status", 
          error: `Availability status must be one of: ${validStatuses.join(', ')}` 
        });
      }

      if (!validShifts.includes(shiftTiming)) {
        logger.error(`Invalid shift timing: ${shiftTiming}`);
        return res.status(400).json({ 
          message: "Invalid shift timing", 
          error: `Shift timing must be one of: ${validShifts.join(', ')}` 
        });
      }

      if (status && !validActiveStatuses.includes(status)) {
        logger.error(`Invalid staff active status: ${status}`);
        return res.status(400).json({ 
          message: "Invalid staff active status", 
          error: `Status must be one of: ${validActiveStatuses.join(', ')}` 
        });
      }

      const storeStaff = await prismaClient.storeStaff.create({
        data: {
          fullName,
          email,
          contactNumber,
          emergencyContact,
          address,
          position,
          experienceYears,
          availabilityStatus,
          shiftTiming,
          joiningDate: new Date(joiningDate),
          status,
          certifications,
          areaOfSpecialization,
          notes,
          createdById
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

      logger.info(`StoreStaff created successfully: ${storeStaff.id} by user: ${createdById}`);
      res.status(201).json(storeStaff);
    } catch (error) {
      logger.error('Error creating StoreStaff:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to create store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to create store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },

  async listStoreStaff(req: Request, res: Response) {
    try {
      const {userId} = req.params;

      if (!userId) {
        logger.error('ListStoreStaff failed: Missing userId in query');
        return res.status(400).json({
          message: "Missing userId parameter",
          error: "userId query parameter is required"
        });
      }

      const storeStaff = await prismaClient.storeStaff.findMany({
        where: {
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      logger.info(`Retrieved ${storeStaff.length} store staff records for user: ${userId}`);
      res.json(storeStaff);
    } catch (error) {
      logger.error('Error fetching StoreStaff list:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },
  async getAllStoreStaff(req: Request, res: Response) {
    try {
      // const userId = req.query.userId as string;

      // if (!userId) {
      //   logger.error('ListStoreStaff failed: Missing userId in query');
      //   return res.status(400).json({
      //     message: "Missing userId parameter",
      //     error: "userId query parameter is required"
      //   });
      // }

      const storeStaff = await prismaClient.storeStaff.findMany({
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

      logger.info(`Retrieved ${storeStaff.length} store staff records for all users`);
      res.json(storeStaff);
    } catch (error) {
      logger.error('Error fetching StoreStaff list:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },

  async getStoreStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      if (!userId) {
        logger.error('GetStoreStaff failed: Missing userId in query');
        return res.status(400).json({
          message: "Missing userId parameter",
          error: "userId query parameter is required"
        });
      }

      const storeStaff = await prismaClient.storeStaff.findFirst({
        where: {
          id: id,
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

      if (!storeStaff) {
        logger.warn(`StoreStaff not found: ${id} for user: ${userId}`);
        return res.status(404).json({ 
          message: "Store staff not found",
          error: 'Store staff record does not exist or you do not have permission to view it' 
        });
      }

      logger.info(`Retrieved StoreStaff: ${id} for user: ${userId}`);
      res.json(storeStaff);
    } catch (error) {
      logger.error('Error fetching StoreStaff:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to fetch store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },

  async updateStoreStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;
      const {
        fullName,
        email,
        contactNumber,
        emergencyContact,
        address,
        position,
        experienceYears,
        availabilityStatus,
        shiftTiming,
        joiningDate,
        status,
        certifications,
        areaOfSpecialization,
        notes
      } = req.body;

      if (!userId) {
        logger.error('UpdateStoreStaff failed: Missing userId in query');
        return res.status(400).json({
          message: "Missing userId parameter",
          error: "userId query parameter is required"
        });
      }

      // Validate enum values if provided
      if (position) {
        const validPositions = Object.values(StaffPosition);
        if (!validPositions.includes(position)) {
          logger.error(`Invalid position: ${position}`);
          return res.status(400).json({ 
            message: "Invalid position", 
            error: `Position must be one of: ${validPositions.join(', ')}` 
          });
        }
      }

      if (availabilityStatus) {
        const validStatuses = Object.values(StaffStatus);
        if (!validStatuses.includes(availabilityStatus)) {
          logger.error(`Invalid availability status: ${availabilityStatus}`);
          return res.status(400).json({ 
            message: "Invalid availability status", 
            error: `Availability status must be one of: ${validStatuses.join(', ')}` 
          });
        }
      }

      if (shiftTiming) {
        const validShifts = Object.values(StaffShift);
        if (!validShifts.includes(shiftTiming)) {
          logger.error(`Invalid shift timing: ${shiftTiming}`);
          return res.status(400).json({ 
            message: "Invalid shift timing", 
            error: `Shift timing must be one of: ${validShifts.join(', ')}` 
          });
        }
      }

      if (status) {
        const validActiveStatuses = ['OFF_DUTY', 'ON_DUTY'];
        if (!validActiveStatuses.includes(status)) {
          logger.error(`Invalid staff active status: ${status}`);
          return res.status(400).json({ 
            message: "Invalid staff active status", 
            error: `Status must be one of: ${validActiveStatuses.join(', ')}` 
          });
        }
      }

      // Check if the store staff exists and belongs to the user
      const existingStoreStaff = await prismaClient.storeStaff.findFirst({
        where: {
          id: id,
          createdById: userId
        }
      });

      if (!existingStoreStaff) {
        logger.warn(`StoreStaff not found for update: ${id} by user: ${userId}`);
        return res.status(404).json({ 
          message: "Store staff not found",
          error: 'Store staff record does not exist or you do not have permission to update it' 
        });
      }

      const updatedStoreStaff = await prismaClient.storeStaff.update({
        where: { id },
        data: {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(contactNumber && { contactNumber }),
          ...(emergencyContact !== undefined && { emergencyContact }),
          ...(address && { address }),
          ...(position && { position }),
          ...(experienceYears && { experienceYears }),
          ...(availabilityStatus && { availabilityStatus }),
          ...(shiftTiming && { shiftTiming }),
          ...(joiningDate && { joiningDate: new Date(joiningDate) }),
          ...(status && { status }),
          ...(certifications !== undefined && { certifications }),
          ...(areaOfSpecialization !== undefined && { areaOfSpecialization }),
          ...(notes !== undefined && { notes })
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

      logger.info(`StoreStaff updated successfully: ${id} by user: ${userId}`);
      res.json(updatedStoreStaff);
    } catch (error) {
      logger.error('Error updating StoreStaff:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to update store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to update store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },

  async deleteStoreStaff(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      if (!userId) {
        logger.error('DeleteStoreStaff failed: Missing userId in query');
        return res.status(400).json({
          message: "Missing userId parameter",
          error: "userId query parameter is required"
        });
      }

      // Check if the store staff exists and belongs to the user
      const existingStoreStaff = await prismaClient.storeStaff.findFirst({
        where: {
          id: id,
          createdById: userId
        }
      });

      if (!existingStoreStaff) {
        logger.warn(`StoreStaff not found for deletion: ${id} by user: ${userId}`);
        return res.status(404).json({ 
          message: "Store staff not found",
          error: 'Store staff record does not exist or you do not have permission to delete it' 
        });
      }

      await prismaClient.storeStaff.delete({
        where: { id }
      });

      logger.info(`StoreStaff deleted successfully: ${id} by user: ${userId}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting StoreStaff:', error);
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "Failed to delete store staff", 
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          message: "Failed to delete store staff", 
          error: 'Unknown error occurred' 
        });
      }
    }
  },

  async updateStaffActivityStatus(req: Request, res: Response) {
    try {
      if (!(req as any).user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First get the current staff to check their status
      const currentStaff = await prismaClient.storeStaff.findUnique({
        where: { id: req.params.id }
      });

      if (!currentStaff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Toggle the status
      const newStatus = currentStaff.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';

      const storeStaff = await prismaClient.storeStaff.update({
        where: { id: req.params.id },
        data: {
          status: newStatus
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
      
      // Notify staff member about status change
      await prismaNotificationService.createNotification({
        to: storeStaff.createdById,
        type: 'staff_status_changed',
        message: `Staff member ${storeStaff.fullName} is now ${newStatus.toLowerCase().replace('_', ' ')}.`,
      });
      
      res.json(storeStaff);
    } catch (error) {
      logger.error("Error updating staff activity status:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
