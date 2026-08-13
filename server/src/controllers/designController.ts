import { Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../logger/logger';
import { uploadFile, uploadImage, deleteFile, deleteImage, extractKeyFromUrl } from '../utils/s3';

export const designController = {
  async createDesign(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { name, clientId, projectId, status, files, images } = req.body;

      const design = await prisma.design.create({
        data: {
          name,
          clientId,
          projectId,
          status,
          files: files || [],
          images: images || [],
          createdById: userId
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      res.status(201).json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listAllDesigns(req: Request, res: Response) {
    try {
      const designs = await prisma.design.findMany({
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async listDesignsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const designs = await prisma.design.findMany({
        where: {
          createdById: userId
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const design = await prisma.design.findUnique({
        where: { id },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }

      res.json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async updateDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, clientId, projectId, status, files, images } = req.body;

      const design = await prisma.design.update({
        where: {
          id,
        },
        data: {
          name,
          clientId,
          projectId,
          status,
          files,
          images
        },
        include: {
          client: true,
          project: true,
          createdBy: true
        }
      });

      res.json(design);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },


  async deleteDesign(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // First, fetch the design to get file and image URLs
      const design = await prisma.design.findUnique({
        where: { id }
      });

      if (!design) {
        return res.status(404).json({ error: 'Design not found' });
      }

      // Delete files from S3
      const fileDeletionPromises = [];

      if (design.files && design.files.length > 0) {
        for (const fileUrl of design.files) {
          try {
            const key = extractKeyFromUrl(fileUrl);
            fileDeletionPromises.push(deleteFile(key));
          } catch (error) {
            logger.error(`Failed to extract key from URL: ${fileUrl}`, error);
          }
        }
      }

      if (design.images && design.images.length > 0) {
        for (const imageUrl of design.images) {
          try {
            const key = extractKeyFromUrl(imageUrl);
            fileDeletionPromises.push(deleteImage(key));
          } catch (error) {
            logger.error(`Failed to extract key from URL: ${imageUrl}`, error);
          }
        }
      }

      // Wait for all S3 deletions to complete
      await Promise.allSettled(fileDeletionPromises);

      // Delete the design from database
      await prisma.design.delete({
        where: {
          id,
        }
      });

      res.status(204).send();
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesignsByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      const designs = await prisma.design.findMany({
        where: { clientId },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async getDesignsByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;

      const designs = await prisma.design.findMany({
        where: { projectId },
        include: {
          client: true,
          project: true,
          createdBy: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(designs);
    } catch (error) {
      logger.error("Error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async uploadDesignFiles(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      // Upload all files to S3
      const uploadPromises = files.map(file => uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Extract URLs from upload results
      const fileUrls = uploadResults.map(result => result.url);

      res.status(200).json({
        message: 'Files uploaded successfully',
        files: uploadResults,
        urls: fileUrls
      });
    } catch (error) {
      logger.error("Error uploading files:", error);
      res.status(500).json({
        message: "Failed to upload files",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  async uploadDesignImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
      }

      // Upload all images to S3
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Extract URLs from upload results
      const imageUrls = uploadResults.map(result => result.url);

      res.status(200).json({
        message: 'Images uploaded successfully',
        images: uploadResults,
        urls: imageUrls
      });
    } catch (error) {
      logger.error("Error uploading images:", error);
      res.status(500).json({
        message: "Failed to upload images",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
};
