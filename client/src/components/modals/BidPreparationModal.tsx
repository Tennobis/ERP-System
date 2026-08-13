import React, { useState, useEffect } from 'react';
import { X, Building2, FileText, Plus, Minus, Calculator, Calendar, User2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';

interface BidPreparationModalProps {
  onClose: () => void;
  editTender?: any;
}

interface RequirementItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
}

interface TenderFormData {
  tenderNumber: string;
  submissionDate: string;
  projectId: string;
  clientId: string;
  location: string;
  projectDuration: number;
  projectCategory: 'COMMERCIAL' | 'RESIDENTIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL';
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  scopeOfWork: string;
  specialRequirements: string;
}

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const UNITS = [
  { value: "PIECE", label: "Pieces" },
  { value: "KILOGRAM", label: "Kilograms" },
  { value: "TONNE", label: "Tonnes" },
  { value: "CUBIC_FEET", label: "Cubic Feet" },
  { value: "M_CUBE", label: "Metre Cube" },
  { value: "SQUARE_FEET", label: "Square Feet" },
  { value: "LITRE", label: "Litres" },
  { value: "BOX", label: "Boxes" },
  { value: "ROLL", label: "Rolls" },
  { value: "SHEET", label: "Sheets" },
  { value: "HOURS", label: "Hours" },
  { value: "DAYS", label: "Days" },
  { value: "LUMPSUM", label: "Lump Sum" },
];

const BidPreparationModal: React.FC<BidPreparationModalProps> = ({ onClose, editTender }) => {
  const { user } = useUser();
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TenderFormData>({
    tenderNumber: editTender?.tenderNumber || `TND-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
    submissionDate: editTender?.submissionDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    projectId: editTender?.projectId || '',
    clientId: editTender?.clientId || '',
    location: editTender?.location || '',
    projectDuration: editTender?.projectDuration || 0,
    projectCategory: editTender?.projectCategory || 'COMMERCIAL',
    priorityLevel: editTender?.priorityLevel || 'MEDIUM',
    scopeOfWork: editTender?.scopeOfWork || '',
    specialRequirements: editTender?.specialRequirements || ''
  });

  useEffect(() => {
    getClients();
    fetchProjects();
    
    // Load existing requirements if editing
    if (editTender?.requirements) {
      setRequirements(editTender.requirements.map((req: any, index: number) => ({
        id: index + 1,
        description: req.description,
        quantity: req.quantity,
        unit: req.unit,
        estimatedCost: req.estimatedCost
      })));
    }
  }, [editTender]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/users/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };
  const getClients = async () => {
            try {
              const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${API_URL}/clients`, { headers });
                if (response.data) {
                    setClients(response.data);
                }
            } catch (error) {
                console.error('Error fetching clients:', error);
                toast.error("Failed to fetch clients");
            }
        };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const addRequirement = () => {
    const newId = Math.max(...requirements.map(item => item.id)) + 1;
    setRequirements([...requirements, {
      id: newId,
      description: '',
      quantity: 0,
      unit: '',
      estimatedCost: 0
    }]);
  };

  const removeRequirement = (id: number) => {
    setRequirements(requirements.filter(item => item.id !== id));
  };

  const updateRequirement = (id: number, field: keyof RequirementItem, value: string | number) => {
    setRequirements(requirements.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalEstimatedCost = requirements.reduce((sum, item) => sum + item.estimatedCost, 0);

  const handleFormChange = (field: keyof TenderFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.clientId || !formData.location || !formData.scopeOfWork) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (requirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

    setLoading(true);
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const userID: string = user?.id || "";  
      
      if (editTender) {
        // Update existing tender
        const tenderResponse = await fetch(`${API_URL}/tenders/${editTender.id}?userId=${userID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(formData)
        });

        if (!tenderResponse.ok) {
          throw new Error('Failed to update tender');
        }

        // Delete existing requirements individually
        if (editTender.requirements) {
          await Promise.all(
            editTender.requirements.map((req: any) =>
              fetch(`${API_URL}/tenders/${editTender.id}/requirements/${req.id}?userId=${userID}`, {
                method: 'DELETE',
                headers
              })
            )
          );
        }

        // Create new requirements
        await Promise.all(
          requirements.map(requirement =>
            fetch(`${API_URL}/tenders/${editTender.id}/requirements?userId=${userID}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers
              },
              body: JSON.stringify({
                description: requirement.description,
                quantity: requirement.quantity,
                unit: requirement.unit,
                estimatedCost: requirement.estimatedCost
              })
            })
          )
        );

        toast.success('Tender updated successfully');
      } else {
        // Create new tender
        const tenderResponse = await fetch(`${API_URL}/tenders?userId=${userID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify(formData)
        });

        if (!tenderResponse.ok) {
          throw new Error('Failed to create tender');
        }

        const tender = await tenderResponse.json();

        // Create requirements for the tender
        await Promise.all(
          requirements.map(requirement =>
            fetch(`${API_URL}/tenders/${tender.id}/requirements?userId=${userID}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers
              },
              body: JSON.stringify({
                description: requirement.description,
                quantity: requirement.quantity,
                unit: requirement.unit,
                estimatedCost: requirement.estimatedCost
              })
            })
          )
        );

        toast.success('Tender created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (editTender ? 'Failed to update tender' : 'Failed to create tender'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-background rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/40">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{editTender ? 'Edit Tender' : 'Create New Tender'}</h2>
              <p className="text-sm text-muted-foreground">{editTender ? 'Update tender details and requirements' : 'Prepare and submit a new tender proposal'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Project Information - Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Project Information */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Project Information
                    </CardTitle>
                    <CardDescription>Fill in the basic tender details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tender Number</label>
                        <Input 
                          value={formData.tenderNumber} 
                          onChange={(e) => handleFormChange('tenderNumber', e.target.value)}
                          className="bg-muted font-mono" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Submission Date</label>
                        <div className="relative">
                          <Input 
                            type="date" 
                            className="pl-9"
                            value={formData.submissionDate}
                            onChange={(e) => handleFormChange('submissionDate', e.target.value)}
                          />
                          <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project *</label>
                      <Select value={formData.projectId} onValueChange={(value) => handleFormChange('projectId', value)}>
                        <SelectTrigger>
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

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Client *</label>
                        <div className="relative">
                          <Select value={formData.clientId} onValueChange={(value) => handleFormChange('clientId', value)}>
                            <SelectTrigger className="pl-9">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name} ({client.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <User2 className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location *</label>
                        <div className="relative">
                          <Input 
                            placeholder="Project location" 
                            className="pl-9"
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                          />
                          <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview & Actions */}
              <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Tender Summary</CardTitle>
                  <CardDescription>Preview tender details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 bg-white space-y-4 shadow-sm">
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-xl">{formData.tenderNumber}</h3>
                      <p className="text-sm text-muted-foreground">{projects.find(p => p.id === formData.projectId)?.name || 'Select Project'}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Value:</span>
                        <span className="font-medium">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{formData.projectDuration || 0} months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Requirements:</span>
                        <span>{requirements.length} items</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Available actions for this tender</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Tender
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                  <Button variant="outline" className="w-full">
                    Preview Documents
                  </Button>
                  <Button variant="outline" className="w-full">
                    Calculate Estimates
                  </Button>
                </CardContent>
              </Card> */}

              {/* <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Submission Checklist</CardTitle>
                  <CardDescription>Required documents and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technical Proposal:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Financial Proposal:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Supporting Docs:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall Status:</span>
                      <span className="font-medium text-yellow-600">In Progress</span>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
              </div>
            </div>

            {/* Full Width Project Requirements */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Project Requirements</CardTitle>
                    <CardDescription>Add project requirements and estimated costs</CardDescription>
                  </div>
                  <Button onClick={addRequirement} size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Requirement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-3">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-3">Estimated Cost</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {requirements.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-muted/5 border rounded-lg hover:bg-muted/10 transition-colors">
                      <div className="col-span-4">
                        <Input
                          placeholder="Enter requirement"
                          value={item.description}
                          onChange={(e) => updateRequirement(item.id, 'description', e.target.value)}
                          className="border-muted"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateRequirement(item.id, 'quantity', Number(e.target.value))}
                          className="border-muted"
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={item.unit}
                          onValueChange={(value) => updateRequirement(item.id, 'unit', value)}
                        >
                          <SelectTrigger className="border-muted">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={item.estimatedCost}
                          onChange={(e) => updateRequirement(item.id, 'estimatedCost', Number(e.target.value))}
                          className="border-muted font-mono"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequirement(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 space-y-3 border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Estimated Cost:</span>
                      <span className="font-mono">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Width Additional Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Add more details to your tender</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Duration (months) *</label>
                    <Input 
                      type="number" 
                      placeholder="24"
                      value={formData.projectDuration || ''}
                      onChange={(e) => handleFormChange('projectDuration', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Category *</label>
                    <Select value={formData.projectCategory} onValueChange={(value: any) => handleFormChange('projectCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                        <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                        <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority Level *</label>
                    <Select value={formData.priorityLevel} onValueChange={(value: any) => handleFormChange('priorityLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Scope of Work *</label>
                  <Textarea 
                    placeholder="Detailed description of work scope..."
                    rows={4}
                    className="resize-none"
                    value={formData.scopeOfWork}
                    onChange={(e) => handleFormChange('scopeOfWork', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Terms & Condition :</label>
                  <Textarea 
                    placeholder="Any special requirements or conditions..."
                    rows={3}
                    className="resize-none"
                    value={formData.specialRequirements}
                    onChange={(e) => handleFormChange('specialRequirements', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Auto-saved 1 minute ago
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                className="bg-[#1e9df1] hover:bg-[#1e9df1] gap-2" 
                onClick={handleSubmit}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
{loading ? (editTender ? 'Updating...' : 'Creating...') : (editTender ? 'Update Tender' : 'Create Tender')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidPreparationModal;