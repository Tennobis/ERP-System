import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../logger/logger';

const prisma = new PrismaClient();

// GET /api/store/overview - Overview tab metrics
export const getStoreOverview = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      // Get inventory KPIs
    const totalItems = await prisma.inventory.count();

    // Get low stock items by comparing quantity with safetyStock
    const lowStockItemsData = await prisma.inventory.findMany({
      // where: { createdById: userId as string },
      select: {
        quantity: true,
        safetyStock: true
      }
    });
    
    const lowStockItems = lowStockItemsData.filter(item => item.quantity <= item.safetyStock).length;

    const totalValue = await prisma.inventory.aggregate({
      // where: { createdById: userId as string },
      _sum: {
        unitCost: true
      }
    });

    // Get transfer statistics
    const activeTransfers = await prisma.materialTransfer.count({
      where: {
        // createdById: userId as string,
        status: { in: ['PENDING', 'IN_TRANSIT'] }
      }
    });

    const completedTransfers = await prisma.materialTransfer.count({
      where: {
        // createdById: userId as string,
        status: 'DELIVERED'
      }
    });

    // Get recent transactions
    const recentTransactions = await prisma.materialTransfer.findMany({
      // where: { createdById: userId as string },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const overview = {
      kpis: {
        totalItems,
        lowStockItems,
        totalValue: totalValue._sum.unitCost || 0,
        activeTransfers,
        completedTransfers
      },
      recentTransactions
    };

    res.json(overview);
    }

    // Get inventory KPIs
    const totalItems = await prisma.inventory.count({
      where: { createdById: userId as string }
    });

    // Get low stock items by comparing quantity with safetyStock
    const lowStockItemsData = await prisma.inventory.findMany({
      where: { createdById: userId as string },
      select: {
        quantity: true,
        safetyStock: true
      }
    });
    
    const lowStockItems = lowStockItemsData.filter(item => item.quantity <= item.safetyStock).length;

    const totalValue = await prisma.inventory.aggregate({
      where: { createdById: userId as string },
      _sum: {
        unitCost: true
      }
    });

    // Get transfer statistics
    const activeTransfers = await prisma.materialTransfer.count({
      where: {
        createdById: userId as string,
        status: { in: ['PENDING', 'IN_TRANSIT'] }
      }
    });

    const completedTransfers = await prisma.materialTransfer.count({
      where: {
        createdById: userId as string,
        status: 'DELIVERED'
      }
    });

    // Get recent transactions
    const recentTransactions = await prisma.materialTransfer.findMany({
      where: { createdById: userId as string },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const overview = {
      kpis: {
        totalItems,
        lowStockItems,
        totalValue: totalValue._sum.unitCost || 0,
        activeTransfers,
        completedTransfers
      },
      recentTransactions
    };

    res.json(overview);
  } catch (error) {
    logger.error('Error fetching store overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/inventory-data - Inventory items with filtering
export const getInventoryData = async (req: Request, res: Response) => {
  try {
    const { userId, category, location } = req.query;
    
    if (!userId) {
      const inventoryItems = await prisma.inventory.findMany({
      include: {
        primarySupplier: true,
        // secondarySupplier: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(inventoryItems);
    }

    const whereClause: any = {
      createdById: userId as string
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (location && location !== 'all') {
      whereClause.location = location;
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: whereClause,
      include: {
        primarySupplier: true,
        secondarySupplier: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(inventoryItems);
  } catch (error) {
    logger.error('Error fetching inventory data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/stock-levels - Stock level data for charts
export const getStockLevels = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const stockData = await prisma.inventory.findMany({
      where: { createdById: userId as string },
      select: {
        itemName: true,
        quantity: true,
        safetyStock: true,
        maximumStock: true,
        category: true,
        itemCode: true
      }
    });

    // Transform data for charts
    const stockLevelsByCategory = stockData.reduce((acc: any, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = { total: 0, low: 0, normal: 0, high: 0 };
      }
      
      acc[category].total += item.quantity;
      
      if (item.quantity <= item.safetyStock) {
        acc[category].low++;
      } else if (item.quantity >= item.maximumStock * 0.8) {
        acc[category].high++;
      } else {
        acc[category].normal++;
      }
      
      return acc;
    }, {});

    res.json({
      stockData,
      stockLevelsByCategory
    });
  } catch (error) {
    logger.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/transfers - Material transfers with filtering
export const getTransfers = async (req: Request, res: Response) => {
  try {
    const { userId, status, priority } = req.query;
    
    if (!userId) {
      const transfers = await prisma.materialTransfer.findMany({
        include: {
          items: {
            include: {
              inventory: true
            }
          },
          approvedBy: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(transfers);
    }

    const whereClause: any = {
      createdById: userId as string
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (priority && priority !== 'all') {
      whereClause.priority = priority;
    }

    const transfers = await prisma.materialTransfer.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            inventory: true
          }
        },
        approvedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transfers);
  } catch (error) {
    logger.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/analytics/turnover - Inventory turnover analytics
export const getInventoryTurnover = async (req: Request, res: Response) => {
  try {
    const { userId, period = '6months' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const monthsBack = period === '6months' ? 6 : period === '12months' ? 12 : 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get material requests as proxy for consumption
    const consumptionData = await prisma.materialRequest.findMany({
      where: {
        requestedBy: userId as string,
        createdAt: { gte: startDate },
        status: 'COMPLETED'
      },
      include: {
        items: true
      }
    });

    // Calculate turnover by month
    const turnoverByMonth = consumptionData.reduce((acc: any, request) => {
      const month = request.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { consumption: 0, requests: 0 };
      }
      acc[month].requests++;
      acc[month].consumption += request.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc;
    }, {});

    // Get current inventory levels for turnover calculation
    const currentInventory = await prisma.inventory.findMany({
      where: { createdById: userId as string },
      select: {
        itemName: true,
        quantity: true,
        unitCost: true,
        category: true
      }
    });

    res.json({
      turnoverByMonth,
      currentInventory,
      totalConsumption: Object.values(turnoverByMonth).reduce((sum: number, month: any) => sum + month.consumption, 0)
    });
  } catch (error) {
    logger.error('Error fetching inventory turnover:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/analytics/consumption - Consumption trends
export const getConsumptionTrends = async (req: Request, res: Response) => {
  try {
    const { userId, period = '6months' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const monthsBack = period === '6months' ? 6 : period === '12months' ? 12 : 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get material requests as consumption data
    const requests = await prisma.materialRequest.findMany({
      where: {
        requestedBy: userId as string,
        createdAt: { gte: startDate },
        status: 'COMPLETED'
      },
      include: {
        items: true,
        project: true
      }
    });

    // Group by month and category
    const consumptionTrends = requests.reduce((acc: any, request) => {
      const month = request.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {};
      }
      
      request.items.forEach(item => {
        const itemKey = item.hsnCode || item.itemName || 'unknown';
        if (!acc[month][itemKey]) {
          acc[month][itemKey] = 0;
        }
        acc[month][itemKey] += item.quantity;
      });
      
      return acc;
    }, {});

    res.json({
      consumptionTrends,
      totalRequests: requests.length,
      avgRequestValue: requests.length > 0 ? requests.reduce((sum, req) => sum + req.items.length, 0) / requests.length : 0
    });
  } catch (error) {
    logger.error('Error fetching consumption trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/analytics/supplier-performance - Supplier performance metrics
export const getSupplierPerformance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get all purchase orders for supplier analysis
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { userId: userId as string },
      include: {
        Vendor: true,
        items: true
      }
    });

    // Calculate supplier metrics
    const supplierMetrics = purchaseOrders.reduce((acc: any, po) => {
      const vendorId = po.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendorName: po.Vendor.name,
          totalOrders: 0,
          totalValue: 0,
          avgDeliveryTime: 0,
          onTimeDeliveries: 0
        };
      }
      
      acc[vendorId].totalOrders++;
      acc[vendorId].totalValue += Number(po.total);
      
      return acc;
    }, {});

    // Get vendor performance from inventory data
    const vendorInventory = await prisma.inventory.findMany({
      where: { createdById: userId as string },
      include: {
        primarySupplier: true
      }
    });

    res.json({
      supplierMetrics,
      topSuppliers: Object.values(supplierMetrics).slice(0, 5),
      vendorInventory
    });
  } catch (error) {
    logger.error('Error fetching supplier performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/store/analytics/cost-analysis - Cost analysis and trends
export const getCostAnalysis = async (req: Request, res: Response) => {
  try {
    const { userId, period = '6months' } = req.query;
    
    if (!userId) {
          const monthsBack = period === '6months' ? 6 : period === '12months' ? 12 : 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get purchase orders for cost analysis
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        // userId: userId as string,
        createdAt: { gte: startDate }
      },
      include: {
        items: true,
        Vendor: true
      }
    });

    // Calculate cost trends by month
    const costByMonth = purchaseOrders.reduce((acc: any, po) => {
      const month = po.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          totalCost: 0,
          orderCount: 0,
          avgOrderValue: 0
        };
      }
      
      acc[month].totalCost += Number(po.total);
      acc[month].orderCount++;
      acc[month].avgOrderValue = acc[month].totalCost / acc[month].orderCount;
      
      return acc;
    }, {});

    // Calculate cost by category from inventory
    const inventoryCosts = await prisma.inventory.findMany({
      // where: { createdById: userId as string },
      select: {
        category: true,
        unitCost: true,
        quantity: true
      }
    });

    const costByCategory = inventoryCosts.reduce((acc: any, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(item.unitCost) * item.quantity;
      return acc;
    }, {});

    res.json({
      costByMonth,
      costByCategory,
      totalSpend: Object.values(costByMonth).reduce((sum: number, month: any) => sum + month.totalCost, 0),
      avgMonthlySpend: Object.values(costByMonth).length > 0 ? 
        Object.values(costByMonth).reduce((sum: number, month: any) => sum + month.totalCost, 0) / Object.values(costByMonth).length : 0
    });
    }

    const monthsBack = period === '6months' ? 6 : period === '12months' ? 12 : 3;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    // Get purchase orders for cost analysis
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        userId: userId as string,
        createdAt: { gte: startDate }
      },
      include: {
        items: true,
        Vendor: true
      }
    });

    // Calculate cost trends by month
    const costByMonth = purchaseOrders.reduce((acc: any, po) => {
      const month = po.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          totalCost: 0,
          orderCount: 0,
          avgOrderValue: 0
        };
      }
      
      acc[month].totalCost += Number(po.total);
      acc[month].orderCount++;
      acc[month].avgOrderValue = acc[month].totalCost / acc[month].orderCount;
      
      return acc;
    }, {});

    // Calculate cost by category from inventory
    const inventoryCosts = await prisma.inventory.findMany({
      where: { createdById: userId as string },
      select: {
        category: true,
        unitCost: true,
        quantity: true
      }
    });

    const costByCategory = inventoryCosts.reduce((acc: any, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(item.unitCost) * item.quantity;
      return acc;
    }, {});

    res.json({
      costByMonth,
      costByCategory,
      totalSpend: Object.values(costByMonth).reduce((sum: number, month: any) => sum + month.totalCost, 0),
      avgMonthlySpend: Object.values(costByMonth).length > 0 ? 
        Object.values(costByMonth).reduce((sum: number, month: any) => sum + month.totalCost, 0) / Object.values(costByMonth).length : 0
    });
  } catch (error) {
    logger.error('Error fetching cost analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};