import { Router } from 'express';
import { issueReportController } from '../controllers/issueReportController';

const router = Router();

// Create a new issue report
router.post('/', issueReportController.createIssueReport);

// Get all issue reports
router.get('/', issueReportController.getAllIssueReports);

// Get issue report by ID
router.get('/:id', issueReportController.getIssueReportById);

// Update issue report by ID
router.put('/:id', issueReportController.updateIssueReport);

// Delete issue report by ID
router.delete('/:id', issueReportController.deleteIssueReport);

// Update issue status
router.patch('/:id/status', issueReportController.updateIssueStatus);

// Assign issue to user
router.patch('/:id/assign', issueReportController.assignIssue);

// Start resolution
router.patch('/:id/start-resolution', issueReportController.startResolution);

// Mark as resolved
router.patch('/:id/mark-resolved', issueReportController.markResolved);

export default router;
