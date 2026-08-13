import prisma from '../config/prisma';

export const prismaPurchaseOrderService = {
  // Purchase Orders
  async createPurchaseOrder(data: any) {
    return prisma.purchaseOrder.create({ data, include: { items: true } });
  },
  async getPurchaseOrders(filter: any = {}) {
    return prisma.purchaseOrder.findMany({ where: filter, include: { items: true } });
  },
  async getPurchaseOrderById(id: string) {
    return prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  },
  async updatePurchaseOrder(id: string, data: any) {
    return prisma.purchaseOrder.update({ where: { id }, data });
  },
  async deletePurchaseOrder(id: string) {
    return prisma.purchaseOrder.delete({ where: { id } });
  },

  // Purchase Order Items
  async addPurchaseOrderItem(purchaseOrderId: string, data: any) {
    return prisma.purchaseOrderItem.create({ data: { ...data, purchaseOrderId } });
  },
  async updatePurchaseOrderItem(id: string, data: any) {
    return prisma.purchaseOrderItem.update({ where: { id }, data });
  },
  async deletePurchaseOrderItem(id: string) {
    return prisma.purchaseOrderItem.delete({ where: { id } });
  },

  // GRN
  async createGRN(data: any) {
    return prisma.gRN.create({ data });
  },
  async getGRNs(filter: any = {}) {
    return prisma.gRN.findMany({ where: filter, include: { purchaseOrder: true } });
  },
  async getGRNById(id: string) {
    return prisma.gRN.findUnique({ where: { id }, include: { purchaseOrder: true } });
  },
  async updateGRN(id: string, data: any) {
    return prisma.gRN.update({ where: { id }, data });
  },
  async deleteGRN(id: string) {
    return prisma.gRN.delete({ where: { id } });
  },
}; 