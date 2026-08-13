
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";

interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  dependencies: string[];
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
}

interface GanttChartProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function GanttChart({ projectId, tasks, onTaskUpdate }: GanttChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Timeline - Gantt Chart</CardTitle>
            <CardDescription>Interactive project scheduling with task dependencies</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
                <SelectItem value="quarter">Quarter View</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-1" />
              Export
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Gantt Chart Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Timeline</div>
          </div>

          {/* Task Rows */}
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`grid grid-cols-12 gap-2 p-3 border rounded-lg hover:shadow-sm transition-shadow ${
                selectedTask === task.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedTask(task.id)}
            >
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    <span className="font-medium">{task.name}</span>
                  </div>
                  <Badge variant={task.status === 'delayed' ? 'destructive' : 'outline'}>
                    {task.status}
                  </Badge>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{task.assignedTo}</span>
              </div>
              
              <div className="col-span-1 flex items-center">
                <span className="text-sm">{task.duration}d</span>
              </div>
              
              <div className="col-span-2 flex items-center gap-2">
                <Progress value={task.progress} className="flex-1" />
                <span className="text-sm">{task.progress}%</span>
              </div>
              
              <div className="col-span-1 flex items-center">
                {getPriorityIcon(task.priority)}
              </div>
              
              <div className="col-span-2">
                <div className="relative h-6 bg-gray-100 rounded">
                  <div 
                    className={`h-full rounded ${getStatusColor(task.status)}`}
                    style={{ width: `${task.progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-2 text-xs">
                    {task.startDate} - {task.endDate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Critical Path Analysis */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Critical Path Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Project Duration:</span>
              <span className="ml-2 font-medium">120 days</span>
            </div>
            <div>
              <span className="text-muted-foreground">Critical Tasks:</span>
              <span className="ml-2 font-medium">8 tasks</span>
            </div>
            <div>
              <span className="text-muted-foreground">Buffer Time:</span>
              <span className="ml-2 font-medium">5 days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
