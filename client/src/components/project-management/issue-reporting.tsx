import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Users, Clock, Camera, Plus, CheckCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";

interface Issue {
  id: string;
  title: string;
  type: 'labor-shortage' | 'machinery-defect' | 'quality-issue' | 'safety-concern' | 'material-delay' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  description: string;
  location: string;
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  photos?: string[];
}

interface IssueReportingProps {
  projectId: string;
  siteId: string;
}

export function IssueReporting({ projectId, siteId }: IssueReportingProps) {
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 'ISS001',
      title: 'Crane hydraulic system failure',
      type: 'machinery-defect',
      priority: 'critical',
      status: 'in-progress',
      reportedBy: 'Site Engineer A',
      reportedAt: '2024-01-20 09:30',
      assignedTo: 'Maintenance Team',
      description: 'Main crane hydraulic system showing pressure drop, affecting lifting operations',
      location: 'Block A - Construction Site',
      estimatedResolutionTime: 4,
      photos: ['crane-issue-1.jpg', 'crane-issue-2.jpg']
    },
    {
      id: 'ISS002',
      title: 'Labor shortage for concrete work',
      type: 'labor-shortage',
      priority: 'high',
      status: 'open',
      reportedBy: 'Site Supervisor',
      reportedAt: '2024-01-20 14:15',
      description: '5 skilled workers required for concrete pouring scheduled tomorrow',
      location: 'Block B - Foundation',
      estimatedResolutionTime: 24
    }
  ]);

  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in-progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const getTypeIcon = (type: Issue['type']) => {
    switch (type) {
      case 'labor-shortage': return <Users className="h-4 w-4" />;
      case 'machinery-defect': return <AlertTriangle className="h-4 w-4" />;
      case 'quality-issue': return <CheckCircle className="h-4 w-4" />;
      case 'safety-concern': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleNewIssue = () => {
    toast.success("Issue reported successfully! Notifications sent to relevant teams.");
    setIsNewIssueOpen(false);
  };

  const handleUpdateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, ...updates } : issue
    ));
    toast.success("Issue updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Open Issues"
          value={issues.filter(i => i.status === 'open').length}
          icon={AlertTriangle}
          description="Require immediate attention"
          trend={{ value: -20, label: "vs last week" }}
          threshold={{ status: 'warning', message: 'Multiple issues need resolution' }}
        />
        <EnhancedStatCard
          title="In Progress"
          value={issues.filter(i => i.status === 'in-progress').length}
          icon={Clock}
          description="Currently being resolved"
          trend={{ value: 15, label: "increase in activity" }}
          threshold={{ status: 'good', message: 'Teams actively working on issues' }}
        />
        <EnhancedStatCard
          title="Resolved Today"
          value="3"
          icon={CheckCircle}
          description="Issues closed successfully"
          trend={{ value: 25, label: "vs yesterday" }}
          threshold={{ status: 'good', message: 'Excellent resolution rate' }}
        />
        <EnhancedStatCard
          title="Avg Resolution"
          value="6.2h"
          icon={TrendingUp}
          description="Average time to resolve"
          trend={{ value: -15, label: "improvement" }}
          threshold={{ status: 'good', message: 'Resolution time improving' }}
        />
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>Comprehensive issue information and tracking</DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(selectedIssue.status)}>
                      {selectedIssue.status}
                    </Badge>
                    <Badge variant={getPriorityColor(selectedIssue.priority)}>
                      {selectedIssue.priority}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">ID: {selectedIssue.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedIssue.reportedAt}</p>
                </div>
              </div>

              {/* Issue Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedIssue.type)}
                    <span className="font-medium capitalize">{selectedIssue.type.replace('-', ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium mt-1">{selectedIssue.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reported By</Label>
                  <p className="font-medium mt-1">{selectedIssue.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned To</Label>
                  <p className="font-medium mt-1">{selectedIssue.assignedTo || 'Not assigned'}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{selectedIssue.description}</p>
              </div>

              {/* Resolution Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Estimated Resolution Time</Label>
                  <p className="font-medium mt-1">
                    {selectedIssue.estimatedResolutionTime 
                      ? `${selectedIssue.estimatedResolutionTime} hours`
                      : 'Not estimated'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Actual Resolution Time</Label>
                  <p className="font-medium mt-1">
                    {selectedIssue.actualResolutionTime 
                      ? `${selectedIssue.actualResolutionTime} hours`
                      : 'In progress'}
                  </p>
                </div>
              </div>

              {/* Photos */}
              {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Attached Photos</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {selectedIssue.photos.map((photo, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">{photo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                {selectedIssue.status === 'open' && (
                  <Button 
                    onClick={() => {
                      handleUpdateIssue(selectedIssue.id, { status: 'in-progress' });
                      setIsViewDetailsOpen(false);
                    }}
                  >
                    Start Resolution
                  </Button>
                )}
                {selectedIssue.status === 'in-progress' && (
                  <Button 
                    onClick={() => {
                      handleUpdateIssue(selectedIssue.id, { status: 'resolved' });
                      setIsViewDetailsOpen(false);
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Site Issue Tracking</CardTitle>
              <CardDescription>Real-time issue reporting and resolution management</CardDescription>
            </div>
            <Dialog open={isNewIssueOpen} onOpenChange={setIsNewIssueOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report New Issue</DialogTitle>
                  <DialogDescription>Document site issues for quick resolution</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue-type">Issue Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="labor-shortage">Labor Shortage</SelectItem>
                          <SelectItem value="machinery-defect">Machinery Defect</SelectItem>
                          <SelectItem value="quality-issue">Quality Issue</SelectItem>
                          <SelectItem value="safety-concern">Safety Concern</SelectItem>
                          <SelectItem value="material-delay">Material Delay</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="raised-by">Raised By</Label>
                      <Input id="raised-by" placeholder="Enter name of person reporting" />
                    </div>
                    <div>
                      <Label htmlFor="estimated-resolution">Estimated Resolution</Label>
                      <Input id="estimated-resolution" placeholder="Enter estimated resolution time" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="assigned-to">Assigned To</Label>
                    <Input id="assigned-to" placeholder="Enter name of person assigned" />
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Issue Title</Label>
                    <Input id="title" placeholder="Brief description of the issue" />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Specific location where issue occurred" />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Provide detailed information about the issue..."
                      rows={4}
                    />
                  </div>
                  
                  {/* <div>
                    <Label htmlFor="photos">Attach Photos</Label>
                    <div className="flex items-center gap-2">
                      <Input id="photos" type="file" multiple accept="image/*" />
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-1" />
                        Camera
                      </Button>
                    </div>
                  </div> */}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewIssueOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNewIssue}>
                      Report Issue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(issue.type)}
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        <Badge variant={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>📍 {issue.location}</span>
                        <span>👤 {issue.reportedBy}</span>
                        <span>🕐 {issue.reportedAt}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3">
                      {issue.assignedTo && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="text-sm font-medium">{issue.assignedTo}</p>
                        </div>
                      )}
                      {issue.estimatedResolutionTime && (
                        <div>
                          <p className="text-xs text-muted-foreground">Est. Resolution</p>
                          <p className="text-sm font-medium">{issue.estimatedResolutionTime}h</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-3 flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsViewDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      {issue.status === 'open' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateIssue(issue.id, { status: 'in-progress' })}
                        >
                          Start Resolution
                        </Button>
                      )}
                      {issue.status === 'in-progress' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateIssue(issue.id, { status: 'resolved' })}
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
