import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const prismaBillingService = {
  async createInvoice(data: Prisma.InvoiceUncheckedCreateInput) {
    return prisma.invoice.create({ data });
  },
  async getInvoices(filter: any = {}) {
    return prisma.invoice.findMany({ where: filter, include: { Payment: true, project: true, client: true } });
  },
  async getInvoiceById(id: string) {
    return prisma.invoice.findUnique({ where: { id }, include: { Payment: true, project: true, client: true } });
  },
  async updateInvoice(id: string, data: Prisma.InvoiceUpdateInput) {
    return prisma.invoice.update({ where: { id }, data });
  },
  async deleteInvoice(id: string) {
    return prisma.invoice.delete({ where: { id } });
  },
  // Payment management
  async addPayment(invoiceId: string, data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({ data: { ...data, invoiceId } });
  },
  async getPayments(invoiceId: string) {
    return prisma.payment.findMany({ where: { invoiceId } });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToAccounts(invoiceId: string, paymentData: any) { ... }
}; 