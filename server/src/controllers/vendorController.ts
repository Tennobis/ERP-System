import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../logger/logger';

const prisma = new PrismaClient();

export const vendorController = {
  async createVendor(req: Request, res: Response) {
    try {
      const vendor = await prisma.vendor.create({
        data: req.body,
      });
      res.status(201).json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getVendors(req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany();
      res.json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  
  async getVendorsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const vendors = await prisma.vendor.findMany({
        where: {
          createdBy: userId
        }
      });
      res.json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getVendorById(req: Request, res: Response) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: req.params.id },
      });
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateVendor(req: Request, res: Response) {
    try {
      const vendor = await prisma.vendor.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(vendor);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async deleteVendor(req: Request, res: Response) {
    try {
      await prisma.vendor.delete({
        where: { id: req.params.id },
      });
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getVendorsCountByUser(req:Request, res: Response){
   try {
      const { userId } = req.params;
      
      const vendors = await prisma.vendor.count({
        where: {
          createdBy: userId
        }
      });
      res.status(200).json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getVendorsCount(req:Request, res: Response){
   try {  
      const vendors = await prisma.vendor.count();
      res.status(200).json(vendors);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 