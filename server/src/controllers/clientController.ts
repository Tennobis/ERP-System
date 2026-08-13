import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';

export const clientController = {
  // Create a new client
  async createClient(req: Request, res: Response) {
    try {
        const {userId} = req.params;
      const client = await prisma.client.create({
        data: {
          ...req.body,
          createdById: userId,
        },
      });
      res.status(201).json(client);
    } catch (error) {
      logger.error("Error creating client:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get all clients (irrespective of who created them)
  async getAllClients(req: Request, res: Response) {
    try {
      const clients = await prisma.client.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Project: true,
          Invoice: true,
        },
      });
      res.json(clients);
    } catch (error) {
      logger.error("Error fetching clients:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get clients created by a specific user
  async getClientsByUser(req: Request, res: Response) {
    try {
      const {userId} = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const clients = await prisma.client.findMany({
        where: {
          createdById: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Project: true,
          Invoice: true,
        },
      });
      res.json(clients);
    } catch (error) {
      logger.error("Error fetching clients by user:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get a specific client by ID
  async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Project: true,
          Invoice: true,
        },
      });
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user is authorized to access this client
      if (req.user?.id !== client.createdById) {
        return res.status(403).json({ message: "Not authorized to access this client" });
      }
      
      res.json(client);
    } catch (error) {
      logger.error("Error fetching client by ID:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update a client
  async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // First, check if client exists and belongs to the user
      const existingClient = await prisma.client.findUnique({
        where: { id },
      });
      
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user is authorized to update this client
      // Allow if user created the client OR user is a client manager
      if (req.user?.id !== existingClient.createdById && req.user?.role !== 'client_manager') {
        return res.status(403).json({ message: "Not authorized to update this client" });
      }
      
      const client = await prisma.client.update({
        where: { id },
        data: req.body,
      });
      
      res.json(client);
    } catch (error) {
      logger.error("Error updating client:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Delete a client
  async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // First, check if client exists and belongs to the user
      const existingClient = await prisma.client.findUnique({
        where: { id },
      });
      
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Check if user is authorized to delete this client
      // Allow if user created the client OR user is a client manager
      if (req.user?.id !== existingClient.createdById && req.user?.role !== 'client_manager') {
        return res.status(403).json({ message: "Not authorized to delete this client" });
      }
      
      await prisma.client.delete({
        where: { id },
      });
      
      res.status(204).end();
    } catch (error) {
      logger.error("Error deleting client:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};