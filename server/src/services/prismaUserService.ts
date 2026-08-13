
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '../utils/constants';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export const prismaUserService = {
  async register(name: string, email: string, password: string, role: UserRole = 'client', invitationToken?: string) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // If you get a linter error here, run 'npx prisma generate' to sync the client with your schema.
    const prismaRole = role.replace("-", "_") as any;
    
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword, // <-- If error: run 'npx prisma generate'
        role: prismaRole,
        status: 'active',
      },
    });
    
    // If invitation token is provided, mark it as used
    if (invitationToken) {
      await this.useInvitation(invitationToken);
    }
    
    return user;
  },

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User doesn't exist");
    }
    // @ts-ignore
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), status: 'active' },
    });
    const payload = {
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    return { user, token };
  },

  async checkIfUsersExist() {
    const count = await prisma.user.count();
    return count > 0;
  },

  async createUserInvitation(email: string, role: UserRole, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    const token = crypto.randomUUID();
    const encryptedData = crypto.createHash('sha256').update(`${email}:${name}:${role}`).digest('hex');
    // @ts-ignore
    await prisma.userInvitation.create({
      data: {
        id: crypto.randomUUID(),
        email,
        role,
        name,
        token,
        encryptedData,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        used: false,
      },
    });
    return token;
  },

  async validateInvitationToken(token: string) {
    // @ts-ignore
    const invitation = await prisma.userInvitation.findFirst({ 
      where: { 
        token,
        used: false 
      } 
    });
    if (!invitation) {
      throw new Error('Invalid or expired invitation token');
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation token has expired');
    }
    if (invitation.used) {
      throw new Error('Invitation token has already been used');
    }
    return invitation;
  },

  async useInvitation(token: string) {
    const invitation = await this.validateInvitationToken(token);
    // @ts-ignore
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: { used: true },
    });
    return invitation;
  },

  async deleteInvitation(token: string) {
    // @ts-ignore
    await prisma.userInvitation.delete({ where: { token } });
    return true;
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });
  },

  
async updateUser(id: string, updates: Partial<{ name: string; email: string; password: string; avatar?: string; status?: string }>) {
  const data: any = { ...updates };
  if (updates.password) {
    data.password = await bcrypt.hash(updates.password, 10);
  }
  // Remove the updatedAt handling - Prisma handles this automatically
  return prisma.user.update({
    where: { id },
    data,
  });
},

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    // @ts-ignore
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });
  },

  async deleteUser(id: string) {
    await prisma.document.deleteMany({ where: { userId: id } });
    return prisma.user.delete({ where: { id } });
  },

  async getUsersByRole(role: UserRole) {
    const prismaRole = role.replace("-", "_") as any;
    return prisma.user.findMany({
      where: { role: prismaRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
    });
  },

  async getUsersWithProjects() {
    return prisma.user.findMany({
      where: {
        OR: [
          { managedProjects: { some: {} } },
          { memberProjects: { some: {} } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        managedProjects: {
          select: {
            id: true,
            name: true
          }
        },
        memberProjects: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });
  },
};
