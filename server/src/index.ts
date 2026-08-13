import express, { Express, Request, Response, NextFunction } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';
import invitationRoutes from './routes/invitation';
import projectRoutes from './routes/project';
import taskRoutes from './routes/task';
import billingRoutes from './routes/billing';
import inventoryRoutes from './routes/inventory';
import tenderRoutes from './routes/tender';
import hrRoutes from './routes/hr';
import accountsRoutes from './routes/accounts';
import notificationRoutes from './routes/notification';
import purchaseOrderRoutes from './routes/purchaseOrder';
import siteOpsRoutes from './routes/siteOps';
import vendorRoutes from './routes/vendor';
import taxRoutes from './routes/tax';
import materialRoutes from './routes/material';
import nonBillableRoutes from './routes/nonBillable';
import issueReportRoutes from './routes/issueReport';
import vehicleRoutes from './routes/vehicle';
import hrSalaryRoutes from './routes/hrSalary';
import eventRoutes from './routes/events';
import scheduleMaintenanceRoutes from './routes/scheduleMaintenance';
import milestoneRoutes from './routes/milestone';
import logger from './logger/logger';
import storeAnalyticsRoutes from './routes/storeAnalytics';
import storeStaffRoutes from './routes/storeStaff';
import progressReportRoutes from './routes/progressReport';
import boqRoutes from './routes/boq';
import designRoutes from './routes/design';
import clientRoutes from './routes/client';
import warehouseRoutes from './routes/warehouse';
import clientBillRoutes from './routes/clientBill';
import materialIndaneRoutes from './routes/materialIndane';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://testboard-1.onrender.com",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.info(`Request received: ${req.method} ${req.url}`);
  
  // Log request body for non-GET requests
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    logger.info(`Request Body: ${JSON.stringify(req.body)}`);
  }
  
  // Log request headers (optional - you can remove this if you don't want to log headers)
  if (req.headers.authorization) {
    logger.info(`Authorization: ${req.headers.authorization.substring(0, 20)}...`);
  }
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/hr-salary', hrSalaryRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/site-ops', siteOpsRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/non-billables', nonBillableRoutes);
app.use('/api/issue-reports', issueReportRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api', eventRoutes);
app.use('/api', scheduleMaintenanceRoutes);
app.use('/api/store', storeAnalyticsRoutes);
app.use('/api/staff', storeStaffRoutes);
app.use('/api/progress-reports', progressReportRoutes);
app.use('/api/boqs', boqRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/client-bills', clientBillRoutes);
app.use('/api/material-indane', materialIndaneRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    logger.error("JSON parsing error:", {
      error: error.message,
      body: req.body,
      url: req.url,
      method: req.method,
    });
    return res.status(400).json({
      error: "Invalid JSON format",
      message:
        "The request body contains malformed JSON. Please check your JSON syntax.",
    });
  }
  next();
});

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});