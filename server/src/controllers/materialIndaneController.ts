import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { uploadFile, uploadImage, deleteFile, extractKeyFromUrl } from '../utils/s3';
import { S3_FOLDERS } from '../utils/s3';

export const materialIndaneController = {
    // Create Material Indane
    async createMaterialIndane(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const {
                orderSlipNo,
                site,
                date,
                storeKeeperName,
                storeKeeperSignature,
                projectManagerName,
                projectManagerSignature,
                items
            } = req.body;

            // Validate required fields
            if (!orderSlipNo || !site || !date || !storeKeeperName || !projectManagerName) {
                return res.status(400).json({
                    message: "Missing required fields: orderSlipNo, site, date, storeKeeperName, projectManagerName"
                });
            }

            const indane = await (prisma as any).materialIndane.create({
                data: {
                    orderSlipNo,
                    site,
                    date: new Date(date),
                    storeKeeperName,
                    storeKeeperSignature,
                    projectManagerName,
                    projectManagerSignature,
                    createdById: userId,
                    items: {
                        create: (items || []).map((item: any, index: number) => ({
                            slNo: item.slNo || index + 1,
                            dateOfOrder: item.dateOfOrder ? new Date(item.dateOfOrder) : null,
                            materialDescription: item.materialDescription,
                            unit: item.unit,
                            requiredQty: parseFloat(item.requiredQty),
                            receivedQty: parseFloat(item.receivedQty) || 0,
                            balance: parseFloat(item.balance) || 0,
                            deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
                            remarks: item.remarks
                        }))
                    }
                },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.info(`Material Indane created: ${indane.id} by user: ${userId}`);
            res.status(201).json(indane);
        } catch (error) {
            logger.error("Error creating Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Get all Material Indanes
    async getAllMaterialIndanes(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const { site, orderSlipNo, startDate, endDate } = req.query;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const whereClause: any = {};

            // Only filter by userId for non-admin/MD users; admin/MD sees all indents
            if (userRole !== 'admin' && userRole !== 'md') {
                whereClause.createdById = userId;
            }

            if (site) {
                whereClause.site = {
                    contains: site as string,
                    mode: 'insensitive'
                };
            }

            if (orderSlipNo) {
                whereClause.orderSlipNo = {
                    contains: orderSlipNo as string,
                    mode: 'insensitive'
                };
            }

            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate) {
                    whereClause.date.gte = new Date(startDate as string);
                }
                if (endDate) {
                    whereClause.date.lte = new Date(endDate as string);
                }
            }

            const indanes = await (prisma as any).materialIndane.findMany({
                where: whereClause,
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });

            logger.info(`Retrieved ${indanes.length} Material Indanes for user ${userId}`);
            res.json(indanes);
        } catch (error) {
            logger.error("Error retrieving Material Indanes:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Get Material Indane by ID
    async getMaterialIndaneById(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;

            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            logger.info(`Retrieved Material Indane: ${indaneId}`);
            res.json(indane);
        } catch (error) {
            logger.error("Error retrieving Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Get Material Indanes by User ID
    async getMaterialIndanesByUser(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const targetUserId = req.params.userId;
            const { site, orderSlipNo, startDate, endDate } = req.query;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Verify user has permission to view another user's data
            if (userRole !== 'admin' && userRole !== 'md' && userId !== targetUserId) {
                return res.status(403).json({ error: 'Not authorized to view this user\'s data' });
            }

            const whereClause: any = {
                createdById: targetUserId
            };

            if (site) {
                whereClause.site = {
                    contains: site as string,
                    mode: 'insensitive'
                };
            }

            if (orderSlipNo) {
                whereClause.orderSlipNo = {
                    contains: orderSlipNo as string,
                    mode: 'insensitive'
                };
            }

            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate) {
                    whereClause.date.gte = new Date(startDate as string);
                }
                if (endDate) {
                    whereClause.date.lte = new Date(endDate as string);
                }
            }

            const indanes = await (prisma as any).materialIndane.findMany({
                where: whereClause,
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });

            logger.info(`Retrieved ${indanes.length} Material Indanes for user ${targetUserId}`);
            res.json(indanes);
        } catch (error) {
            logger.error("Error retrieving Material Indanes by user:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Update Material Indane
    async updateMaterialIndane(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const {
                orderSlipNo,
                site,
                date,
                storeKeeperName,
                storeKeeperSignature,
                projectManagerName,
                projectManagerSignature,
                items
            } = req.body;

            // Check ownership
            const existingIndane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!existingIndane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (existingIndane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete old items if updating
            if (items) {
                await (prisma as any).materialIndaneItem.deleteMany({
                    where: { indaneId }
                });
            }

            const indane = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: {
                    ...(orderSlipNo && { orderSlipNo }),
                    ...(site && { site }),
                    ...(date && { date: new Date(date) }),
                    ...(storeKeeperName && { storeKeeperName }),
                    ...(storeKeeperSignature !== undefined && { storeKeeperSignature }),
                    ...(projectManagerName && { projectManagerName }),
                    ...(projectManagerSignature !== undefined && { projectManagerSignature }),
                    ...(items && {
                        items: {
                            create: items.map((item: any, index: number) => ({
                                slNo: item.slNo || index + 1,
                                dateOfOrder: item.dateOfOrder ? new Date(item.dateOfOrder) : null,
                                materialDescription: item.materialDescription,
                                unit: item.unit,
                                requiredQty: parseFloat(item.requiredQty),
                                receivedQty: parseFloat(item.receivedQty) || 0,
                                balance: parseFloat(item.balance) || 0,
                                deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
                                remarks: item.remarks
                            }))
                        }
                    })
                },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.info(`Material Indane updated: ${indaneId} by user: ${userId}`);
            res.json(indane);
        } catch (error) {
            logger.error("Error updating Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Delete Material Indane
    async deleteMaterialIndane(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const existingIndane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!existingIndane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (existingIndane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await (prisma as any).materialIndane.delete({
                where: { id: indaneId }
            });

            logger.info(`Material Indane deleted: ${indaneId} by user: ${userId}`);
            res.status(204).send();
        } catch (error) {
            logger.error("Error deleting Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Add Item to Material Indane
    async addItem(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const {
                slNo,
                dateOfOrder,
                materialDescription,
                unit,
                requiredQty,
                receivedQty,
                balance,
                deliveryDate,
                remarks
            } = req.body;

            if (!materialDescription || !unit || requiredQty === undefined) {
                return res.status(400).json({
                    message: "Missing required fields: materialDescription, unit, requiredQty"
                });
            }

            // Verify indane exists and user has access
            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Get max slNo if not provided
            const maxSlNo = await (prisma as any).materialIndaneItem.aggregate({
                where: { indaneId },
                _max: { slNo: true }
            });

            const item = await (prisma as any).materialIndaneItem.create({
                data: {
                    indaneId,
                    slNo: slNo || (maxSlNo._max.slNo || 0) + 1,
                    dateOfOrder: dateOfOrder ? new Date(dateOfOrder) : null,
                    materialDescription,
                    unit,
                    requiredQty: parseFloat(requiredQty),
                    receivedQty: parseFloat(receivedQty) || 0,
                    balance: parseFloat(balance) || 0,
                    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                    remarks
                }
            });

            logger.info(`Item added to Material Indane: ${indaneId}`);
            res.status(201).json(item);
        } catch (error) {
            logger.error("Error adding item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Update Item
    async updateItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const {
                slNo,
                dateOfOrder,
                materialDescription,
                unit,
                requiredQty,
                receivedQty,
                balance,
                deliveryDate,
                remarks
            } = req.body;

            // Verify item exists and user has access
            const item = await (prisma as any).materialIndaneItem.findUnique({
                where: { id: itemId },
                include: { indane: true }
            });

            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            if (item.indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const updatedItem = await (prisma as any).materialIndaneItem.update({
                where: { id: itemId },
                data: {
                    ...(slNo !== undefined && { slNo }),
                    ...(dateOfOrder !== undefined && { dateOfOrder: dateOfOrder ? new Date(dateOfOrder) : null }),
                    ...(materialDescription && { materialDescription }),
                    ...(unit && { unit }),
                    ...(requiredQty !== undefined && { requiredQty: parseFloat(requiredQty) }),
                    ...(receivedQty !== undefined && { receivedQty: parseFloat(receivedQty) }),
                    ...(balance !== undefined && { balance: parseFloat(balance) }),
                    ...(deliveryDate !== undefined && { deliveryDate: deliveryDate ? new Date(deliveryDate) : null }),
                    ...(remarks !== undefined && { remarks })
                }
            });

            logger.info(`Item updated: ${itemId}`);
            res.json(updatedItem);
        } catch (error) {
            logger.error("Error updating item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Delete Item
    async deleteItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const item = await (prisma as any).materialIndaneItem.findUnique({
                where: { id: itemId },
                include: { indane: true }
            });

            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            if (item.indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await (prisma as any).materialIndaneItem.delete({
                where: { id: itemId }
            });

            logger.info(`Item deleted: ${itemId}`);
            res.status(204).send();
        } catch (error) {
            logger.error("Error deleting item:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Upload store keeper signature
    async uploadStoreKeeperSignature(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete old signature if exists
            if (indane.storeKeeperSignature) {
                try {
                    const oldKey = extractKeyFromUrl(indane.storeKeeperSignature);
                    await deleteFile(oldKey);
                } catch (error) {
                    logger.warn(`Failed to delete old store keeper signature: ${error}`);
                }
            }

            // Upload new signature
            const { url, key } = await uploadImage(req.file);

            const updated = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: { storeKeeperSignature: url }
            });

            logger.info(`Store keeper signature uploaded for indane: ${indaneId}`);
            res.json({ url, key, indane: updated });
        } catch (error) {
            logger.error("Error uploading store keeper signature:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Upload project manager signature
    async uploadProjectManagerSignature(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Delete old signature if exists
            if (indane.projectManagerSignature) {
                try {
                    const oldKey = extractKeyFromUrl(indane.projectManagerSignature);
                    await deleteFile(oldKey);
                } catch (error) {
                    logger.warn(`Failed to delete old project manager signature: ${error}`);
                }
            }

            // Upload new signature
            const { url, key } = await uploadImage(req.file);

            const updated = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: { projectManagerSignature: url }
            });

            logger.info(`Project manager signature uploaded for indane: ${indaneId}`);
            res.json({ url, key, indane: updated });
        } catch (error) {
            logger.error("Error uploading project manager signature:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Upload supporting documents
    async uploadSupportingDocuments(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!req.files || (req.files as any).length === 0) {
                return res.status(400).json({ error: 'No files provided' });
            }

            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const files = req.files as Express.Multer.File[];
            const uploadedFiles = [];

            for (const file of files) {
                const { url, key, fileName } = await uploadFile(file, `${S3_FOLDERS.FILES}/materialIndane/${indaneId}`);
                uploadedFiles.push({ url, key, fileName });
            }

            logger.info(`${uploadedFiles.length} supporting documents uploaded for indane: ${indaneId}`);
            res.json({ files: uploadedFiles });
        } catch (error) {
            logger.error("Error uploading supporting documents:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Delete supporting document
    async deleteSupportingDocument(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const { fileKey } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            if (!fileKey) {
                return res.status(400).json({ error: 'File key is required' });
            }

            const indane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!indane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            if (indane.createdById !== userId && (req as any).user?.role !== 'admin' && (req as any).user?.role !== 'md') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            await deleteFile(fileKey);

            logger.info(`Supporting document deleted from indane: ${indaneId}`);
            res.json({ success: true, message: 'Document deleted successfully' });
        } catch (error) {
            logger.error("Error deleting supporting document:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Approve Material Indane
    async approveMaterialIndane(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Check if indane exists
            const existingIndane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!existingIndane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            // Update status to APPROVED
            const indane = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: { status: 'APPROVED' },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.info(`Material Indane ${indaneId} approved by user ${userId}`);
            res.json(indane);
        } catch (error) {
            logger.error("Error approving Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Reject Material Indane
    async rejectMaterialIndane(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Check if indane exists
            const existingIndane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!existingIndane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            // Update status to REJECTED
            const indane = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: { status: 'REJECTED' },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.info(`Material Indane ${indaneId} rejected by user ${userId}`);
            res.json(indane);
        } catch (error) {
            logger.error("Error rejecting Material Indane:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Get Material Indanes by Status
    async getMaterialIndanesByStatus(req: Request, res: Response) {
        try {
            const { status } = req.params;
            const userId = (req as any).user?.id;
            const { global } = req.query;

            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(status.toUpperCase())) {
                return res.status(400).json({ error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' });
            }

            // Build where clause - include userId filter only if not requesting global results
            const whereClause: any = {
                status: status.toUpperCase()
            };

            // If global=true query param is passed, fetch all indents regardless of user
            // Otherwise, filter by current user's ID
            if (global !== 'true' && userId) {
                whereClause.createdById = userId;
            }

            const indanes = await (prisma as any).materialIndane.findMany({
                where: whereClause,
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });

            const logMessage = global === 'true' 
                ? `Retrieved ${indanes.length} Material Indanes with status ${status} (global fetch)`
                : `Retrieved ${indanes.length} Material Indanes with status ${status} for user ${userId}`;
            
            logger.info(logMessage);
            res.json(indanes);
        } catch (error) {
            logger.error("Error retrieving Material Indanes by status:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    },

    // Undo Material Indane Status (set to PENDING)
    async undoMaterialIndaneStatus(req: Request, res: Response) {
        try {
            const { indaneId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Check if indane exists
            const existingIndane = await (prisma as any).materialIndane.findUnique({
                where: { id: indaneId }
            });

            if (!existingIndane) {
                return res.status(404).json({ error: 'Material Indane not found' });
            }

            // Update status to PENDING
            const indane = await (prisma as any).materialIndane.update({
                where: { id: indaneId },
                data: { status: 'PENDING' },
                include: {
                    items: {
                        orderBy: { slNo: 'asc' }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            logger.info(`Material Indane ${indaneId} status reverted to PENDING by user ${userId}`);
            res.json(indane);
        } catch (error) {
            logger.error("Error undoing Material Indane status:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
};
