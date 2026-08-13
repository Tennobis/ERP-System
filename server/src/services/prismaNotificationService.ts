import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const prismaNotificationService = {
  async createNotification(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },
  async getNotifications(filter: any = {}) {
    return prisma.notification.findMany({ where: filter, include: { user: true } });
  },
  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
  // Message management
  async sendMessage(data: Prisma.MessageCreateInput) {
    return prisma.message.create({ data });
  },
  async getMessages(filter: any = {}) {
    return prisma.message.findMany({ where: filter, include: { sender: true, receiver: true } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async notifyEvent(eventType: string, payload: any) { ... }
}; 