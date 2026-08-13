import prisma from '../config/prisma';

export const prismaSiteOpsService = {
  // Equipment Maintenance
  async createEquipmentMaintenance(data: any) {
    return prisma.equipmentMaintenance.create({ data });
  },
  async getEquipmentMaintenances(filter: any = {}) {
    return prisma.equipmentMaintenance.findMany({ where: filter });
  },
  async getEquipmentMaintenanceById(id: string) {
    return prisma.equipmentMaintenance.findUnique({ where: { id } });
  },
  async updateEquipmentMaintenance(id: string, data: any) {
    return prisma.equipmentMaintenance.update({ where: { id }, data });
  },
  async deleteEquipmentMaintenance(id: string) {
    return prisma.equipmentMaintenance.delete({ where: { id } });
  },

  // Labor Log
  async createLaborLog(data: any) {
    return prisma.laborLog.create({ data });
  },
  async getLaborLogs(filter: any = {}) {
    return prisma.laborLog.findMany({ where: filter });
  },
  async getLaborLogById(id: string) {
    return prisma.laborLog.findUnique({ where: { id } });
  },
  async updateLaborLog(id: string, data: any) {
    return prisma.laborLog.update({ where: { id }, data });
  },
  async deleteLaborLog(id: string) {
    return prisma.laborLog.delete({ where: { id } });
  },

  // Budget Adjustment
  async createBudgetAdjustment(data: any) {
    return prisma.budgetAdjustment.create({ data });
  },
  async getBudgetAdjustments(filter: any = {}) {
    return prisma.budgetAdjustment.findMany({ where: filter });
  },
  async getBudgetAdjustmentById(id: string) {
    return prisma.budgetAdjustment.findUnique({ where: { id } });
  },
  async updateBudgetAdjustment(id: string, data: any) {
    return prisma.budgetAdjustment.update({ where: { id }, data });
  },
  async deleteBudgetAdjustment(id: string) {
    return prisma.budgetAdjustment.delete({ where: { id } });
  },

  // Issue Report
  async createIssueReport(data: any) {
    return prisma.issueReport.create({ 
      data,
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
  },
  async getIssueReports(filter: any = {}, userID: string) {
    const { userId, ...validFilter } = filter;
    if(userId){
      return prisma.issueReport.findMany({ 
      where: {
        createdById: userID as string,
        ...validFilter
      },
      include: {
        assignedTo: true,
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    }else {
      return prisma.issueReport.findMany({ 
      where: {
        ...validFilter
      },
      include: {
        assignedTo: true,
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    }
    
  },
  async getIssueReportById(id: string) {
    return prisma.issueReport.findUnique({ 
      where: { id },
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
  },
  async updateIssueReport(id: string, data: any) {
    return prisma.issueReport.update({ 
      where: { id }, 
      data,
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
  },
  async deleteIssueReport(id: string) {
    return prisma.issueReport.delete({ where: { id } });
  },

  // Daily Progress Report
  async createDailyProgressReport(data: any) {
    return prisma.dailyProgressReport.create({ data });
  },
  async getDailyProgressReports(filter: any = {}) {
    return prisma.dailyProgressReport.findMany({ where: filter });
  },
  async getDailyProgressReportById(id: string) {
    return prisma.dailyProgressReport.findUnique({ where: { id } });
  },
  async updateDailyProgressReport(id: string, data: any) {
    return prisma.dailyProgressReport.update({ where: { id }, data });
  },
  async deleteDailyProgressReport(id: string) {
    return prisma.dailyProgressReport.delete({ where: { id } });
  },

  // Weekly Progress Report
  async createWeeklyProgressReport(data: any) {
    return prisma.weeklyProgressReport.create({ data });
  },
  async getWeeklyProgressReports(filter: any = {}) {
    return prisma.weeklyProgressReport.findMany({ where: filter });
  },
  async getWeeklyProgressReportById(id: string) {
    return prisma.weeklyProgressReport.findUnique({ where: { id } });
  },
  async updateWeeklyProgressReport(id: string, data: any) {
    return prisma.weeklyProgressReport.update({ where: { id }, data });
  },
  async deleteWeeklyProgressReport(id: string) {
    return prisma.weeklyProgressReport.delete({ where: { id } });
  },

  // Event
  async createEvent(data: any) {
    return prisma.event.create({ data });
  },
  async getEvents(filter: any = {}) {
    return prisma.event.findMany({ where: filter });
  },
  async getEventById(id: string) {
    return prisma.event.findUnique({ where: { id } });
  },
  async updateEvent(id: string, data: any) {
    return prisma.event.update({ where: { id }, data });
  },
  async deleteEvent(id: string) {
    return prisma.event.delete({ where: { id } });
  },
}; 