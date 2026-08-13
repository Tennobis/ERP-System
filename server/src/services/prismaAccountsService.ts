import prisma from '../config/prisma';

export const prismaAccountsService = {
  async createPayment(data: any) {
    return prisma.payment.create({ data });
  },
  async getPayments(filter = {}) {
    return prisma.payment.findMany({ where: filter, include: { Invoice: true } });
  },
  async getPaymentById(id: string) {
    return prisma.payment.findUnique({ where: { id }, include: { Invoice: true } });
  },
  async updatePayment(id: string, data: any) {
    return prisma.payment.update({ where: { id }, data });
  },
  async deletePayment(id: string) {
    return prisma.payment.delete({ where: { id } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToInvoice(paymentId, invoiceId) { ... }
}; 