import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const prismaProjectService = {
  async createProject(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data,
      include: { managers: true }
    });
  },
  async getProjects(filter: any = {}) {
    return prisma.project.findMany({ where: filter, include: { tasks: true, invoices: true, materialRequests: true, managers: true } });
  },
  async getProjectById(id: string) {
    return prisma.project.findUnique({ where: { id }, include: { managers: true, tasks: true, invoices: true, materialRequests: true } });
  },
  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data });
  },
  async deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  },
  // Task management
  async addTask(projectId: string, data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ data: { ...data, projectId } });
  },
  async updateTask(taskId: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id: taskId }, data });
  },
  async getTasks(projectId: string) {
    return prisma.task.findMany({ where: { projectId } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToBilling(projectId: string, invoiceData: any) { ... }
  // async linkToInventory(projectId: string, materialRequestData: any) { ... }
}; 