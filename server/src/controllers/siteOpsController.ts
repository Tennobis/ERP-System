import { Request, Response } from 'express';
import { prismaSiteOpsService } from '../services/prismaSiteOpsService';
import logger from '../logger/logger';

export const siteOpsController = {
  // Equipment Maintenance
  async createEquipmentMaintenance(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createEquipmentMaintenance(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getEquipmentMaintenances(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEquipmentMaintenances(req.query);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getEquipmentMaintenanceById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEquipmentMaintenanceById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateEquipmentMaintenance(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateEquipmentMaintenance(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteEquipmentMaintenance(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteEquipmentMaintenance(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Labor Log
  async createLaborLog(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createLaborLog(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getLaborLogs(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getLaborLogs(req.query);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getLaborLogById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getLaborLogById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateLaborLog(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateLaborLog(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteLaborLog(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteLaborLog(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Budget Adjustment
  async createBudgetAdjustment(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createBudgetAdjustment(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getBudgetAdjustments(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getBudgetAdjustments(req.query);
      res.json(result);
    }catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getBudgetAdjustmentById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getBudgetAdjustmentById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateBudgetAdjustment(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateBudgetAdjustment(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteBudgetAdjustment(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteBudgetAdjustment(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Issue Report
  async createIssueReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createIssueReport(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getIssueReports(req: Request, res: Response) {

    try {
      const {userId} = req.query;
      const result = await prismaSiteOpsService.getIssueReports(req.query, userId as string);
      res.json(result);
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
      const result = await prismaSiteOpsService.getIssueReportById(req.params.id);
      res.json(result);
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
      const result = await prismaSiteOpsService.updateIssueReport(req.params.id, req.body);
      res.json(result);
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
      await prismaSiteOpsService.deleteIssueReport(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Daily Progress Report
  async createDailyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createDailyProgressReport(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getDailyProgressReports(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getDailyProgressReports(req.query);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getDailyProgressReportById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getDailyProgressReportById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateDailyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateDailyProgressReport(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteDailyProgressReport(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteDailyProgressReport(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Weekly Progress Report
  async createWeeklyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createWeeklyProgressReport(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getWeeklyProgressReports(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getWeeklyProgressReports(req.query);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getWeeklyProgressReportById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getWeeklyProgressReportById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateWeeklyProgressReport(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateWeeklyProgressReport(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteWeeklyProgressReport(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteWeeklyProgressReport(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Event
  async createEvent(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.createEvent(req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getEvents(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEvents(req.query);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async getEventById(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.getEventById(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async updateEvent(req: Request, res: Response) {
    try {
      const result = await prismaSiteOpsService.updateEvent(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async deleteEvent(req: Request, res: Response) {
    try {
      await prismaSiteOpsService.deleteEvent(req.params.id);
      res.status(204).end();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
}; 