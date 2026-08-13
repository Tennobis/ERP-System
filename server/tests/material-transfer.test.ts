import { Request, Response } from 'express';
import { inventoryController } from '../src/controllers/inventoryController';
import prisma from '../src/config/prisma';

// Mock the prisma client
jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  inventory: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  materialTransfer: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

describe('Material Transfer Creation', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockReq = {
      user: { id: 'creator-user-id' },
      body: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create material transfer with proper inventory management', async () => {
    // Mock request data
    mockReq.body = {
      transferID: 'TR-001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      requestedDate: '2024-01-15',
      fromUserId: 'store-user-1',
      toUserId: 'store-user-2',
      items: [
        {
          itemCode: 'ITEM-001',
          itemName: 'CEMENT',
          type: 'NEW',
          quantity: 10,
          notes: 'High quality cement'
        }
      ]
    };

    // Mock user validation
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'store-user-1', name: 'Store User 1', email: 'store1@test.com', role: 'store' })
      .mockResolvedValueOnce({ id: 'store-user-2', name: 'Store User 2', email: 'store2@test.com', role: 'store' });

    // Mock inventory item found in from user's inventory
    (prisma.inventory.findFirst as jest.Mock)
      .mockResolvedValueOnce({
        id: 'inventory-item-1',
        itemCode: 'ITEM-001',
        itemName: 'CEMENT',
        type: 'NEW',
        quantity: 50,
        category: 'CONSTRUCTION_MATERIALS',
        unit: 'TONNE',
        location: 'Warehouse A',
        maximumStock: 100,
        safetyStock: 5,
        primarySupplierName: 'Supplier A',
        vendorId: 'vendor-1',
        secondarySupplierName: null,
        secondaryVendorId: null,
        unitCost: 5000,
        imageUrl: null,
        createdById: 'store-user-1'
      })
      .mockResolvedValueOnce(null); // No existing item in to user's inventory

    // Mock transaction
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback({
        inventory: {
          update: jest.fn().mockResolvedValue({}),
        },
        materialTransfer: {
          create: jest.fn().mockResolvedValue({
            id: 'transfer-1',
            transferID: 'TR-001',
            fromLocation: 'Warehouse A',
            toLocation: 'Warehouse B',
            status: 'PENDING',
            items: mockReq.body.items
          }),
        },
      });
    });

    // Execute the function
    await inventoryController.createMaterialTransfer(mockReq as Request, mockRes as Response);

    // Verify the response
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: "Material transfer created successfully",
      transfer: expect.any(Object),
      inventoryUpdates: expect.any(Number)
    });
  });

  it('should return error when from user is not found', async () => {
    mockReq.body = {
      transferID: 'TR-001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      requestedDate: '2024-01-15',
      fromUserId: 'non-existent-user',
      toUserId: 'store-user-2',
      items: []
    };

    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // from user not found
      .mockResolvedValueOnce({ id: 'store-user-2', role: 'store' });

    await inventoryController.createMaterialTransfer(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: "One or both users not found" });
  });

  it('should return error when user does not have store role', async () => {
    mockReq.body = {
      transferID: 'TR-001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      requestedDate: '2024-01-15',
      fromUserId: 'admin-user',
      toUserId: 'store-user-2',
      items: []
    };

    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'admin-user', role: 'admin' })
      .mockResolvedValueOnce({ id: 'store-user-2', role: 'store' });

    await inventoryController.createMaterialTransfer(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ error: "Both users must have store role" });
  });

  it('should return error when item not found in from user inventory', async () => {
    mockReq.body = {
      transferID: 'TR-001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      requestedDate: '2024-01-15',
      fromUserId: 'store-user-1',
      toUserId: 'store-user-2',
      items: [
        {
          itemCode: 'ITEM-001',
          itemName: 'CEMENT',
          type: 'NEW',
          quantity: 10
        }
      ]
    };

    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'store-user-1', role: 'store' })
      .mockResolvedValueOnce({ id: 'store-user-2', role: 'store' });

    // Mock inventory item not found
    (prisma.inventory.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await inventoryController.createMaterialTransfer(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ 
      error: "Item not found in from user's inventory: ITEM-001 - CEMENT (NEW)" 
    });
  });

  it('should return error when insufficient quantity available', async () => {
    mockReq.body = {
      transferID: 'TR-001',
      fromLocation: 'Warehouse A',
      toLocation: 'Warehouse B',
      requestedDate: '2024-01-15',
      fromUserId: 'store-user-1',
      toUserId: 'store-user-2',
      items: [
        {
          itemCode: 'ITEM-001',
          itemName: 'CEMENT',
          type: 'NEW',
          quantity: 100 // Requesting more than available
        }
      ]
    };

    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'store-user-1', role: 'store' })
      .mockResolvedValueOnce({ id: 'store-user-2', role: 'store' });

    // Mock inventory item with insufficient quantity
    (prisma.inventory.findFirst as jest.Mock).mockResolvedValueOnce({
      id: 'inventory-item-1',
      itemCode: 'ITEM-001',
      itemName: 'CEMENT',
      type: 'NEW',
      quantity: 50, // Only 50 available, but requesting 100
      category: 'CONSTRUCTION_MATERIALS',
      unit: 'TONNE',
      location: 'Warehouse A',
      maximumStock: 100,
      safetyStock: 5,
      primarySupplierName: 'Supplier A',
      vendorId: 'vendor-1',
      secondarySupplierName: null,
      secondaryVendorId: null,
      unitCost: 5000,
      imageUrl: null,
      createdById: 'store-user-1'
    });

    await inventoryController.createMaterialTransfer(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ 
      error: "Insufficient quantity for item ITEM-001 - CEMENT. Available: 50, Requested: 100" 
    });
  });
});
