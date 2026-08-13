import { Request, Response } from 'express';
import { prismaNotificationService } from '../services/prismaNotificationService';
import logger from '../logger/logger';

export const notificationController = {
  async createNotification(req: Request, res: Response) {
    // TODO: Add validation and RBAC
    try {
      const notification = await prismaNotificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listNotifications(req: Request, res: Response) {
    try {
      const notifications = await prismaNotificationService.getNotifications({ to: req.user?.id });
      res.json(notifications);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async markAsRead(req: Request, res: Response) {
    try {
      const notification = await prismaNotificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  // Message endpoints
  async sendMessage(req: Request, res: Response) {
    try {
      const message = await prismaNotificationService.sendMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
  async listMessages(req: Request, res: Response) {
    try {
      const messages = await prismaNotificationService.getMessages({ to: req.user?.id });
      res.json(messages);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 