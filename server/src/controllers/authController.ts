import { Request, Response } from "express";
import { prismaUserService } from "../services/prismaUserService";
import { UserRole } from "../utils/constants";
import logger from "../logger/logger";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, name, invitationToken } = req.body;
      
      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // If invitation token is provided, verify it
      if (invitationToken) {
        const invitationData = await prismaUserService.validateInvitationToken(invitationToken);
        if (!invitationData) {
          return res.status(400).json({ error: "Invalid invitation token" });
        }
        if (invitationData.email !== email || invitationData.role !== role) {
          return res.status(400).json({ 
            error: "Invalid registration details. Please use the email and role from your invitation." 
          });
        }
      }
      
      const user = await prismaUserService.register(name, email, password, role as UserRole, invitationToken);
      res.status(201).json({ 
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
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

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const { user, token } = await prismaUserService.login(email, password);
      
      // Return 200 for successful login, not 201
      res.status(200).json({ 
        message: "User logged in successfully", 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if it's an authentication error vs validation error
      if (error.message.includes("Invalid credentials") || 
          error.message.includes("User not found") ||
          error.message.includes("Invalid password")) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // For other errors, return 400
      res.status(400).json({ error: error.message || "Login failed" });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await prismaUserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const updates = req.body;
      
      // Validate that there are updates to make
      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No updates provided" });
      }
      
      const updatedUser = await prismaUserService.updateUser(userId, updates);
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt
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

  async createUserInvitation(req: Request, res: Response) {
    try {
      const { email, role, name } = req.body;
      
      if (!email || !role || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const invitationToken = await prismaUserService.createUserInvitation(email, role as UserRole, name);
      const registrationUrl = `${process.env.CLIENT_URL || "https://testboard-1.onrender.com"}/register?token=${invitationToken}`;
      
      res.status(201).json({ 
        message: "User invitation created successfully", 
        registrationUrl,
        invitationToken 
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async validateInvitationToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      const userData = await prismaUserService.validateInvitationToken(token);
      if (!userData) {
        return res.status(400).json({ error: "Invalid or expired invitation token" });
      }
      
      res.status(200).json({
        message: "Token is valid",
        data: userData
      });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match" });
      }

      // Validate new password is different from current
      if (currentPassword === newPassword) {
        return res.status(400).json({ error: "New password must be different from current password" });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters long" });
      }

      // Change the password using the service
      await prismaUserService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        message: "Password changed successfully"
      });
    } catch (error) {
      logger.error("Error:", error);
      
      if (error instanceof Error && error.message === "Invalid current password") {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      // Clear cookie if using cookie-based auth
      res.clearCookie('token');
      // For stateless JWT, just return success message
      // Set user status to inactive if possible
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        let payload;
        try {
          payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'changeme');
        } catch (err) {
          // Ignore token errors
        }
        if (payload && payload.id) {
          // Update user status to inactive
          await require('../config/prisma').default.user.update({
            where: { id: payload.id },
            data: { status: 'inactive' },
          });
        }
      }
      res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
