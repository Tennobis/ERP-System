import prisma from '../config/prisma';

export const prismaHRService = {
  async createEmployee(data: any) {
    return prisma.employee.create({ data });
  },
  async getEmployees(filter = {}) {
    return prisma.employee.findMany({ where: filter});
  },
  async getEmployeeById(id: string) {
    return prisma.employee.findUnique({ where: { id }});
  },
  async updateEmployee(id: string, data: any) {
    return prisma.employee.update({ where: { id }, data });
  },
  async deleteEmployee(id: string) {
    return prisma.employee.delete({ where: { id } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToPayroll(employeeId, payrollData) { ... }
}; 