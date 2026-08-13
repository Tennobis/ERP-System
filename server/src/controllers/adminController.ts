import { Request, Response } from 'express';
import { prismaUserService } from '../services/prismaUserService';
import { UserRole } from '../utils/constants';
import logger from '../logger/logger';

export const adminController = {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role, name } = req.body;

      // Only admin can create users
      const adminRole = req.user?.role;
      if (adminRole !== 'admin') {
        res.status(403).json({ error: 'Only admin can create users' });
        return;
      }

      const user = await prismaUserService.register(name, email, password, role as UserRole);
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async createInitialAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      
      // Check if any user exists
      const usersExist = await prismaUserService.checkIfUsersExist();
      
      // If users exist, prevent creating initial admin
      if (usersExist) {
        res.status(403).json({ 
          error: 'Initial admin can only be created when no users exist' 
        });
        return;
      }

      const user = await prismaUserService.register(name, email, password, 'admin');
      res.status(201).json({
        message: 'Initial admin created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}; 