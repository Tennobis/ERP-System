import prisma from '../config/prisma';

export const prismaTenderService = {
  async createTender(data: any) {
    return prisma.tender.create({ data });
  },
  async getTenders(filter: any = {}) {
    return prisma.tender.findMany({ where: filter, include: { bids: true } });
  },
  async getTenderById(id: string) {
    return prisma.tender.findUnique({ where: { id }, include: { bids: true } });
  },
  async updateTender(id: string, data: any) {
    return prisma.tender.update({ where: { id }, data });
  },
  async deleteTender(id: string) {
    return prisma.tender.delete({ where: { id } });
  },
  // Bid management
  async createBid(tenderId: string, data: any) {
    return prisma.bid.create({ data: { ...data, tenderId } });
  },
  async getBids(tenderId: string) {
    return prisma.bid.findMany({ where: { tenderId } });
  },
  async updateBid(bidId: string, data: any) {
    return prisma.bid.update({ where: { id: bidId }, data });
  },
  // Cross-module stubs (to be implemented as needed)
  // async linkToPurchase(tenderId, purchaseData) { ... }
}; 