import express from 'express';
import { prismaUserService } from '../services/prismaUserService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Create invitation
router.post('/', async (req, res) => {
  const { email, name, role } = req.body;
  try {
    const token = await prismaUserService.createUserInvitation(email, role, name);
    res.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

// Validate invitation token
router.post('/validate-token', async (req, res) => {
  const { token } = req.body;
  try {
    // @ts-ignore
    const invitation = await prisma.userInvitation.findFirst({
      where: {
        token,
        used: false,
      },
    });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already used' });
    }
    res.json(invitation);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 