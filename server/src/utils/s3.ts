import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || ''; // Optional: for CDN

// File type configurations
const FILE_FOLDER = 'files';
const IMAGE_FOLDER = 'images';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    // AutoCAD file types
    'application/acad',
    'application/x-acad',
    'application/autocad_dwg',
    'image/x-dwg',
    'image/vnd.dwg',
    'drawing/x-dwg',
    'application/dwg',
    'application/x-dwg',
    'application/x-autocad',
    'image/x-dxf',
    'application/dxf',
    'application/x-dxf',
    'application/dwf',
    'drawing/dwf',
    // Additional CAD and design files
    'application/octet-stream', // Generic binary (used by many CAD files)
];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB (increased for AutoCAD files)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB (increased)

/**
 * Generate a unique filename with timestamp and random hash
 */
const generateUniqueFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseName}_${timestamp}_${randomHash}${ext}`;
};

/**
 * Get the full S3 URL for a file
 */
const getFileUrl = (key: string): string => {
    if (CLOUDFRONT_URL) {
        return `${CLOUDFRONT_URL}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

/**
 * Upload a file to S3
 * @param file - File buffer and metadata
 * @param folder - Folder path in S3 (default: 'files')
 * @returns Object containing the S3 key and public URL
 */
export const uploadFile = async (
    file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    },
    folder: string = FILE_FOLDER
): Promise<{ key: string; url: string; fileName: string }> => {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype) && !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed`);
        }

        const fileName = generateUniqueFileName(file.originalname);
        const key = `${folder}/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // Uncomment if you want public access without signed URLs
        });

        await s3Client.send(command);

        const url = getFileUrl(key);

        return {
            key,
            url,
            fileName,
        };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Upload an image to S3
 * @param file - Image buffer and metadata
 * @returns Object containing the S3 key and public URL
 */
export const uploadImage = async (file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}): Promise<{ key: string; url: string; fileName: string }> => {
    try {
        // Validate image size
        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds maximum limit of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
        }

        // Validate image type
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            throw new Error(`Image type ${file.mimetype} is not allowed`);
        }

        const fileName = generateUniqueFileName(file.originalname);
        const key = `${IMAGE_FOLDER}/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // Uncomment if you want public access without signed URLs
        });

        await s3Client.send(command);

        const url = getFileUrl(key);

        return {
            key,
            url,
            fileName,
        };
    } catch (error) {
        console.error('Error uploading image to S3:', error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Delete a file from S3
 * @param key - S3 object key (path)
 * @returns Success status
 */
export const deleteFile = async (key: string): Promise<boolean> => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Delete an image from S3
 * @param key - S3 object key (path)
 * @returns Success status
 */
export const deleteImage = async (key: string): Promise<boolean> => {
    return deleteFile(key);
};

/**
 * Update/Replace a file in S3
 * @param oldKey - Current S3 object key
 * @param newFile - New file buffer and metadata
 * @param folder - Folder path in S3
 * @returns Object containing the new S3 key and public URL
 */
export const updateFile = async (
    oldKey: string,
    newFile: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    },
    folder: string = FILE_FOLDER
): Promise<{ key: string; url: string; fileName: string }> => {
    try {
        // Upload new file
        const uploadResult = await uploadFile(newFile, folder);

        // Delete old file
        await deleteFile(oldKey);

        return uploadResult;
    } catch (error) {
        console.error('Error updating file in S3:', error);
        throw new Error(`Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Update/Replace an image in S3
 * @param oldKey - Current S3 object key
 * @param newImage - New image buffer and metadata
 * @returns Object containing the new S3 key and public URL
 */
export const updateImage = async (
    oldKey: string,
    newImage: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }
): Promise<{ key: string; url: string; fileName: string }> => {
    try {
        // Upload new image
        const uploadResult = await uploadImage(newImage);

        // Delete old image
        await deleteImage(oldKey);

        return uploadResult;
    } catch (error) {
        console.error('Error updating image in S3:', error);
        throw new Error(`Failed to update image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Generate a presigned URL for temporary access to a private file
 * @param key - S3 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export const getPresignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return url;
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Copy/Move a file within S3
 * @param sourceKey - Source S3 object key
 * @param destinationKey - Destination S3 object key
 * @param deleteSource - Whether to delete the source file after copying
 * @returns New file URL
 */
export const copyFile = async (
    sourceKey: string,
    destinationKey: string,
    deleteSource: boolean = false
): Promise<{ key: string; url: string }> => {
    try {
        const command = new CopyObjectCommand({
            Bucket: BUCKET_NAME,
            CopySource: `${BUCKET_NAME}/${sourceKey}`,
            Key: destinationKey,
        });

        await s3Client.send(command);

        if (deleteSource) {
            await deleteFile(sourceKey);
        }

        const url = getFileUrl(destinationKey);

        return {
            key: destinationKey,
            url,
        };
    } catch (error) {
        console.error('Error copying file in S3:', error);
        throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Extract S3 key from URL
 * @param url - Full S3 or CloudFront URL
 * @returns S3 key
 */
export const extractKeyFromUrl = (url: string): string => {
    try {
        if (CLOUDFRONT_URL && url.startsWith(CLOUDFRONT_URL)) {
            return url.replace(`${CLOUDFRONT_URL}/`, '');
        }

        const urlObj = new URL(url);
        return urlObj.pathname.substring(1); // Remove leading '/'
    } catch (error) {
        console.error('Error extracting key from URL:', error);
        throw new Error('Invalid URL format');
    }
};

// Export constants for use in controllers
export const S3_FOLDERS = {
    FILES: FILE_FOLDER,
    IMAGES: IMAGE_FOLDER,
};

export const S3_LIMITS = {
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE,
    ALLOWED_FILE_TYPES,
    ALLOWED_IMAGE_TYPES,
};
