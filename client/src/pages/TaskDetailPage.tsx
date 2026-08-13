import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy data (copy from SiteDashboard for now)
const tasks = [
  {
    id: "TASK-2",
    name: "Steel Structure",
    project: "Main Building",
    assignedTo: "Jane Smith",
    startDate: "2024-01-16",
    dueDate: "2024-02-15",
    status: "In Progress",
    progress: 75,
    phase: "Structure",
  },
  {
    id: "TASK-3",
    name: "Roofing Installation",
    project: "Main Building",
    assignedTo: "Mike Johnson",
    startDate: "2024-02-01",
    dueDate: "2024-02-28",
    status: "In Progress",
    progress: 45,
    phase: "Roofing",
  },
];

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) return <div>Task not found</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Details for {task.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Task Name:</strong> {task.name}
            </div>
            <div>
              <strong>Assigned To:</strong> {task.assignedTo}
            </div>
            <div>
              <strong>Project:</strong> {task.project}
            </div>
            <div>
              <strong>Phase:</strong> {task.phase}
            </div>
            <div>
              <strong>Start Date:</strong> {task.startDate}
            </div>
            <div>
              <strong>Due Date:</strong> {task.dueDate}
            </div>
            <div>
              <strong>Status:</strong> {task.status}
            </div>
            <div>
              <strong>Progress:</strong> {task.progress}%
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Active Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetailPage; 