import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, FileText, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Project {
  id: string;
  name: string;
  client: {
    name: string;
  };
}

interface BOQFormData {
  projectId: string;
  template: string;
  workPackage: string;
  names: string;
  description: string;
  unitSystem: string;
  currency: string;
  rateDatabase: string;
  analysisMethod: string;
  contingency: number;
  overhead: number;
  profitMargin: number;
}

interface BOQFormProps {
  onSubmit: (data: BOQFormData) => void;
  onCancel: () => void;
  initialData?: Partial<BOQFormData>;
  isEditing?: boolean;
}
const BOQForm: React.FC<BOQFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isEditing = false,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BOQFormData>({
    projectId: initialData.projectId || "",
    template: initialData.template || "",
    workPackage: initialData.workPackage || "",
    names: initialData.names || "",
    description: initialData.description || "",
    unitSystem: initialData.unitSystem || "METRIC",
    currency: initialData.currency || "INR",
    rateDatabase: initialData.rateDatabase || "",
    analysisMethod: initialData.analysisMethod || "",
    contingency: initialData.contingency || 10,
    overhead: initialData.overhead || 15,
    profitMargin: initialData.profitMargin || 10,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    field: keyof BOQFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (
      !formData.projectId ||
      !formData.template ||
      !formData.workPackage ||
      !formData.names
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting BOQ:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project Information Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Information
          </CardTitle>
          <CardDescription>
            Select project details and BOQ configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleInputChange("projectId", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">BOQ Template *</Label>
              <Select
                value={formData.template}
                onValueChange={(value) => handleInputChange("template", value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIVIL_WORKS">Civil Works</SelectItem>
                  <SelectItem value="MEP_WORKS">MEP Works</SelectItem>
                  <SelectItem value="FINISHING_WORKS">
                    Finishing Works
                  </SelectItem>
                  <SelectItem value="INFRASTRUCTURE_WORKS">
                    Infrastructure Works
                  </SelectItem>
                  <SelectItem value="LANDSCAPING_WORKS">
                    Landscaping Works
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Work Package *</Label>
              <Select
                value={formData.workPackage}
                onValueChange={(value) =>
                  handleInputChange("workPackage", value)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOUNDATION_WORKS">
                    Foundation Works
                  </SelectItem>
                  <SelectItem value="STRUCTURAL_WORKS">
                    Structural Works
                  </SelectItem>
                  <SelectItem value="FINISHING_WORKS">
                    Finishing Works
                  </SelectItem>
                  <SelectItem value="EXTERNAL_WORKS">External Works</SelectItem>
                  <SelectItem value="MEP_INSTALLATIONS">
                    MEP Installation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">BOQ Name *</Label>
              <Input
                placeholder="Enter BOQ name"
                className="h-11"
                value={formData.names}
                onChange={(e) => handleInputChange("names", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Input
                placeholder="Brief description of the BOQ"
                className="h-11"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            BOQ Configuration
          </CardTitle>
          <CardDescription>
            Configure units, currency, and calculation parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Basic Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Unit System</Label>
                  <Select
                    value={formData.unitSystem}
                    onValueChange={(value) =>
                      handleInputChange("unitSystem", value)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="METRIC">Metric System</SelectItem>
                      <SelectItem value="IMPERIAL">Imperial System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleInputChange("currency", value)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Rate Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rate Database</Label>
                  <Input
                    placeholder="Add your rate for analysis"
                    className="h-11"
                    value={formData.rateDatabase}
                    onChange={(e) =>
                      handleInputChange("rateDatabase", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Analysis Method</Label>
                  <Input
                    placeholder="Add your analysis method"
                    className="h-11"
                    value={formData.analysisMethod}
                    onChange={(e) =>
                      handleInputChange("analysisMethod", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium text-sm mb-4">Cost Factors (%)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Contingency</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="100"
                    className="h-11 pr-8"
                    value={formData.contingency}
                    onChange={(e) =>
                      handleInputChange(
                        "contingency",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Overhead</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="15"
                    min="0"
                    max="100"
                    className="h-11 pr-8"
                    value={formData.overhead}
                    onChange={(e) =>
                      handleInputChange(
                        "overhead",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profit Margin</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="100"
                    className="h-11 pr-8"
                    value={formData.profitMargin}
                    onChange={(e) =>
                      handleInputChange(
                        "profitMargin",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-6"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="h-11 px-8">
            <Calculator className="h-4 w-4 mr-2" />
            {loading
              ? "Processing..."
              : isEditing
              ? "Update BOQ"
              : "Generate BOQ"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BOQForm;
