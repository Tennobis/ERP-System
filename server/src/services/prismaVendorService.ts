import prisma from '../config/prisma';

export const prismaVendorService = {
  async createVendor(data: any) {
    return prisma.vendor.create({ data });
  },
  async getVendors(filter: any = {}) {
    return prisma.vendor.findMany({ where: filter });
  },
  async getVendorById(id: string) {
    return prisma.vendor.findUnique({ where: { id } });
  },
  async updateVendor(id: string, data: any) {
    return prisma.vendor.update({ where: { id }, data });
  },
  async deleteVendor(id: string) {
    return prisma.vendor.delete({ where: { id } });
  },
}; 