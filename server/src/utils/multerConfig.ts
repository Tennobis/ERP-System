import multer from 'multer';

// Configure multer to use memory storage (for S3 upload)
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG images are allowed.'));
    }
};

// File filter for documents
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
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
        'application/octet-stream', // Generic binary (used by many CAD files)
    ];

    // Additional check for AutoCAD file extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.dwg', '.dxf', '.dwf'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, AutoCAD (DWG, DXF, DWF), and image files are allowed.'));
    }
};

// Multer upload configurations
export const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for images (increased)
    },
});

export const uploadFile = multer({
    storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for files (increased for AutoCAD files)
    },
});

// Multiple files upload
export const uploadMultipleImages = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file (increased)
        files: 10, // Maximum 10 files
    },
});

export const uploadMultipleFiles = multer({
    storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file (increased for AutoCAD files)
        files: 10, // Maximum 10 files
    },
});
