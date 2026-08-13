import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calculator,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import BOQForm from "./BOQForm";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";
interface BOQ {
  id: string;
  names: string;
  description: string;
  template: string;
  workPackage: string;
  unitSystem: string;
  currency: string;
  rateDatabase: string;
  analysisMethod: string;
  contingency: number;
  overhead: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    client: {
      name: string;
    };
  };
  createdBy: {
    name: string;
  };
}
interface BOQManagementProps {
  targetUserId?: string;
  selectedUser?:any;
  currentUser?:any;
  setSelectedUserId?:(value:string)=>void;
}
interface Project {
  id: string;
  name: string;
  client: {
    name: string;
  };
}

const BOQManagement: React.FC<BOQManagementProps> = () => {
  const [boqs, setBOQs] = useState<BOQ[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBOQ, setSelectedBOQ] = useState<BOQ | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all-projects");

  // Get user from context
  const { user } = useUser();
    const { targetUserId,  currentUser, selectedUser, setSelectedUserId } =  useUserFilter();

    const userID = targetUserId || user?.id || ""

  // Get user role for permission checks
  const userRole = user?.role;
  const canCreateEdit =
    userRole === "accounts" ||
    userRole === "admin" ||
    userRole === "design" ||
    userRole === "client-manager";
  const canDelete = userRole === "admin" || userRole === "accounts" || userRole === "client-manager";

  useEffect(() => {
    if (userID) {
      fetchBOQs();
      fetchProjects();
    }
  }, [userID]);

  const fetchBOQs = async () => {
    try {
      setLoading(true);
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");

      if (!user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view BOQs.",
          variant: "destructive",
        });
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = ((user?.role==="admin"|| user?.role==="md") ?  selectedUser?.id == currentUser?.id : (user?.role==="admin"|| user?.role==="md"))
          ? `${API_URL}/boqs`
          : `${API_URL}/boqs?userId=${userID}`;
          console.log("Fetching BOQs from endpoint:", endpoint);
      const response = await axios.get(endpoint, {
        headers,
      });
      setBOQs(response.data);
    } catch (error) {
      console.error("Error fetching BOQs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch BOQs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateBOQ = async (formData: any) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");

      console.log("User ID:", user?.id);
      console.log("User role:", user?.role);
      console.log("Can delete:", canDelete);
      console.log("Creating BOQ with token:", token ? "present" : "missing");
      console.log("Form data:", formData);

      if (!user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create BOQ.",
          variant: "destructive",
        });
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(`${API_URL}/boqs`, formData, { headers });

      toast({
        title: "BOQ Created",
        description: "Your Bill of Quantities has been created successfully.",
      });

      setIsCreateModalOpen(false);
      fetchBOQs();
    } catch (error) {
      console.error("Error creating BOQ:", error);
      toast({
        title: "Error",
        description: "Failed to create BOQ. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateBOQ = async (formData: any) => {
    if (!selectedBOQ) return;

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${API_URL}/boqs/${selectedBOQ.id}?userId=${userID}`,
        formData,
        { headers }
      );

      toast({
        title: "BOQ Updated",
        description: "Your Bill of Quantities has been updated successfully.",
      });

      setIsEditModalOpen(false);
      setSelectedBOQ(null);
      fetchBOQs();
    } catch (error) {
      console.error("Error updating BOQ:", error);
      toast({
        title: "Error",
        description: "Failed to update BOQ. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteBOQ = async () => {
    if (!selectedBOQ) return;

    console.log("Attempting to delete BOQ");
    console.log("User role:", user?.role);
    console.log("Can delete:", canDelete);

    // Check if user has permission to delete
    if (!canDelete) {
      toast({
        title: "Permission Denied",
        description:
          "You don't have permission to delete BOQs. Only admins, accounts, or client managers can delete.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");

      if (!user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to delete BOQ.",
          variant: "destructive",
        });
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(
        `${API_URL}/boqs/${selectedBOQ.id}?userId=${userID}`,
        {
          headers,
        }
      );

      toast({
        title: "BOQ Deleted",
        description: `"${selectedBOQ.names}" has been permanently deleted.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedBOQ(null);
      fetchBOQs();
    } catch (error: any) {
      console.error("Error deleting BOQ:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete BOQ. Please try again.";
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleExportBOQs = () => {
    // Implementation for exporting BOQs
    toast({
      title: "Export Started",
      description: "Your BOQs are being exported. Download will start shortly.",
    });
  };

  const getStatusBadgeVariant = (template: string) => {
    switch (template) {
      case "CIVIL_WORKS":
        return "default";
      case "MEP_WORKS":
        return "secondary";
      case "FINISHING_WORKS":
        return "outline";
      case "INFRASTRUCTURE_WORKS":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatTemplate = (template: string) => {
    return template.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatWorkPackage = (workPackage: string) => {
    return workPackage
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const filteredBOQs = boqs.filter((boq) => {
    const statusMatch =
      statusFilter === "all" ||
      boq.template.toLowerCase().includes(statusFilter);
    const projectMatch =
      projectFilter === "all-projects" || boq.project.id === projectFilter;
    return statusMatch && projectMatch;
  });



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bill of Quantities Management</CardTitle>
            <CardDescription>
              Create, manage and track your BOQs for tender preparation
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New BOQ
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="civil">Civil Works</SelectItem>
                  <SelectItem value="mep">MEP Works</SelectItem>
                  <SelectItem value="finishing">Finishing Works</SelectItem>
                  <SelectItem value="infrastructure">
                    Infrastructure Works
                  </SelectItem>
                  <SelectItem value="landscaping">Landscaping Works</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-projects">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportBOQs}>
                <Download className="h-4 w-4 mr-2" />
                Export BOQs
              </Button>
            </div>
          </div>

          {/* BOQ List */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BOQ Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Work Package</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading BOQs...
                    </TableCell>
                  </TableRow>
                ) : filteredBOQs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No BOQs found. Create your first BOQ to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBOQs.map((boq) => {
                    const isRecent =
                      new Date(boq.createdAt) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return (
                      <TableRow key={boq.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {boq.names}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {boq.project.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {boq.project.client.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(boq.template)}>
                            {formatTemplate(boq.template)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatWorkPackage(boq.workPackage)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {boq.currency}
                            <span className="text-xs text-muted-foreground">
                              ({boq.profitMargin}% profit)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>
                              {new Date(boq.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              by {boq.createdBy.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBOQ(boq);
                                setIsViewModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canCreateEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBOQ(boq);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedBOQ(boq);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>


        </div>
      </CardContent>

      {/* Create BOQ Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Create New Bill of Quantities
                </DialogTitle>
                <DialogDescription className="text-base">
                  Create comprehensive BOQs with automated calculations and rate
                  analysis
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-6">
            <BOQForm
              onSubmit={handleCreateBOQ}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit BOQ Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Edit Bill of Quantities
                </DialogTitle>
                <DialogDescription className="text-base">
                  Update your BOQ configuration and parameters
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-6">
            {selectedBOQ && (
              <BOQForm
                onSubmit={handleUpdateBOQ}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedBOQ(null);
                }}
                initialData={selectedBOQ}
                isEditing={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View BOQ Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>BOQ Details</DialogTitle>
            <DialogDescription>
              View Bill of Quantities information
            </DialogDescription>
          </DialogHeader>
          {selectedBOQ && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedBOQ.names}
                    </div>
                    <div>
                      <strong>Description:</strong> {selectedBOQ.description}
                    </div>
                    <div>
                      <strong>Project:</strong> {selectedBOQ.project.name}
                    </div>
                    <div>
                      <strong>Client:</strong> {selectedBOQ.project.client.name}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Template:</strong>{" "}
                      {formatTemplate(selectedBOQ.template)}
                    </div>
                    <div>
                      <strong>Work Package:</strong>{" "}
                      {formatWorkPackage(selectedBOQ.workPackage)}
                    </div>
                    <div>
                      <strong>Unit System:</strong> {selectedBOQ.unitSystem}
                    </div>
                    <div>
                      <strong>Currency:</strong> {selectedBOQ.currency}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cost Factors</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Contingency:</strong> {selectedBOQ.contingency}%
                  </div>
                  <div>
                    <strong>Overhead:</strong> {selectedBOQ.overhead}%
                  </div>
                  <div>
                    <strong>Profit Margin:</strong> {selectedBOQ.profitMargin}%
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Analysis Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Rate Database:</strong>{" "}
                    {selectedBOQ.rateDatabase || "Not specified"}
                  </div>
                  <div>
                    <strong>Analysis Method:</strong>{" "}
                    {selectedBOQ.analysisMethod || "Not specified"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <div>
                  Created: {new Date(selectedBOQ.createdAt).toLocaleString()}
                </div>
                <div>
                  Last Updated:{" "}
                  {new Date(selectedBOQ.updatedAt).toLocaleString()}
                </div>
                <div>Created By: {selectedBOQ.createdBy.name}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl">
                  Delete BOQ
                </AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  This action cannot be undone and will permanently remove all
                  data.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {selectedBOQ && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">BOQ Details:</h4>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Name:</strong> {selectedBOQ.names}
                </div>
                <div>
                  <strong>Project:</strong> {selectedBOQ.project.name}
                </div>
                <div>
                  <strong>Template:</strong>{" "}
                  {formatTemplate(selectedBOQ.template)}
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {new Date(selectedBOQ.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <AlertDialogDescription className="text-red-600 font-medium">
            ⚠️ Warning: This will permanently delete all BOQ data, calculations,
            and associated records.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBOQ}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BOQManagement;
