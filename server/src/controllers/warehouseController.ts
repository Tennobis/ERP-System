import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const warehouseController = {
  async createWarehouse(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const warehouseData = {
        ...req.body,
        createdById: userId as string,
      };

      const warehouse = await prisma.warehouse.create({
        data: warehouseData,
        include: {
          createdBy: true
        }
      });

      res.status(201).json(warehouse);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listWarehouses(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if(userId){
        const warehouses = await prisma.warehouse.findMany({
          where: {
            createdById: userId as string
          },
          include: {
            createdBy: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        res.json(warehouses);
      } else {
        const warehouses = await prisma.warehouse.findMany({
          // include: {
          //   createdBy: true
          // },
          orderBy: {
            createdAt: 'desc'
          }
        });

        res.json(warehouses);
      }
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const warehouse = await prisma.warehouse.findUnique({
        where: { id },
        include: {
          createdBy: true
        }
      });

      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }

      res.json(warehouse);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingWarehouse = await prisma.warehouse.findUnique({
        where: { id }
      });

      if (!existingWarehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }

      const warehouse = await prisma.warehouse.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: true
        }
      });

      res.json(warehouse);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingWarehouse = await prisma.warehouse.findUnique({
        where: { id }
      });

      if (!existingWarehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }

      await prisma.warehouse.delete({
        where: { id }
      });

      res.json({ message: "Warehouse deleted successfully" });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
