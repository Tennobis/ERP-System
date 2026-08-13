import express from 'express';
import { prismaUserService } from '../services/prismaUserService';
import prisma from '../config/prisma';
import logger from '../logger/logger';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prismaUserService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get users with role 'client' for select options
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(clients);
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get users with projects
router.get('/with-projects', async (req, res) => {
  try {
    const users = await prismaUserService.getUsersWithProjects();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users with projects' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updated = await prismaUserService.updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await prismaUserService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 