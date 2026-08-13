import React from 'react';
import { IssueReportingFunctional } from './issue-reporting-functional';

// Example of how to use the functional issue reporting component

// 1. In SiteDashboard.tsx - replace the existing issue tracker tab content:
/*
<TabsContent value="issues" className="space-y-6">
  <IssueReportingFunctional projectId={selectedProject?.id} siteId={siteId} />
</TabsContent>
*/

// 2. In Inventory.tsx - replace the existing issue tracking section:
/*
<TabsContent value="issues" className="space-y-6">
  <IssueReportingFunctional />
</TabsContent>
*/

// 3. As a standalone component for accounts dashboard:
export function AccountsIssueTracking() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Issue Tracking</h2>
      <IssueReportingFunctional />
    </div>
  );
}

// 4. Usage with specific project context:
export function ProjectIssueTracking({ projectId }: { projectId: string }) {
  return (
    <IssueReportingFunctional projectId={projectId} />
  );
}

// API Endpoints Available:
/*
Backend Routes Created:
- POST /api/issue-reports - Create new issue
- GET /api/issue-reports - Get all issues (with filtering)
- GET /api/issue-reports/:id - Get specific issue
- PUT /api/issue-reports/:id - Update issue
- DELETE /api/issue-reports/:id - Delete issue
- PATCH /api/issue-reports/:id/status - Update status
- PATCH /api/issue-reports/:id/assign - Assign to user
- PATCH /api/issue-reports/:id/start-resolution - Start resolution (updates startResolutionAt, isStartResolution)
- PATCH /api/issue-reports/:id/mark-resolved - Mark resolved (calculates actualResolutionTime automatically)

Supporting Routes:
- GET /api/users - Get all users (for client selection and assignment)
- GET /api/projects - Get all projects (for project selection)
*/

export default AccountsIssueTracking;
