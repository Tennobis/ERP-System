import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clipboard, Filter, Plus, Search, MapPin, Users, AlertTriangle, TrendingUp, Camera, FileText, Upload, X, Edit, Loader2, ChevronDown, ChevronRight, AreaChart, LandPlot, Building, Building2, DeleteIcon, Delete, LucideDelete, Trash2, CalendarDays, Calendar1Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Project {
    id: number;
    name: string;
    clientId: string;
    budget: number;
    totalSpend: number;
    deadline: string;
    location: string;
    manager: string;
    squareFootage?: number;
    startDate: string;
    estimatedDuration?: number;
    description?: string;
    contractType?: string;
    estimatedCost?: number;
    milestones?: Array<{
        id?: number;
        name: string;
        startDate: string;
        endDate?: string;
    }>;
    itemRate?: string;
    withOrWithoutItem?: boolean;
    costPlus?: string;
    withOrWithoutCostPlus?: boolean;
    coverArea?: string;
    coverAreaUnit?: string;
    withOrWithoutCoverArea?: boolean;
    structuralConsultant?: string;
    architecturalConsultants?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const StatCard = ({ title, value, icon: Icon, trend, onClick = undefined }) => (
    <Card
        className={`transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
        onClick={onClick}
    >
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            {trend && (
                <p className={`text-xs mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
                </p>
            )}
        </CardContent>
    </Card>
);

const ProjectHeatmap = ({ projects, handleViewDetails }) => {
    const weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heatmapProjects = [
        { name: 'Residential Complex A', data: [0.8, 0.6, 0.9, 0.7, 0.5, 0.3, 0.1] },
        { name: 'Office Tower B', data: [0.4, 0.7, 0.3, 0.8, 0.6, 0.2, 0.0] },
        { name: 'Shopping Mall C', data: [0.9, 0.8, 0.7, 0.6, 0.8, 0.4, 0.2] },
        { name: 'Luxury Villas', data: [0.2, 0.1, 0.3, 0.2, 0.1, 0.0, 0.0] },
        { name: 'Industrial Complex', data: [0.5, 0.4, 0.2, 0.1, 0.3, 0.0, 0.0] }
    ];

    const getIntensityColor = (intensity) => {
        if (intensity === 0) return 'bg-gray-100 border border-gray-200';
        if (intensity <= 0.2) return 'bg-green-100 border border-green-200';
        if (intensity <= 0.4) return 'bg-green-200 border border-green-300';
        if (intensity <= 0.6) return 'bg-green-300 border border-green-400';
        if (intensity <= 0.8) return 'bg-green-400 border border-green-500';
        return 'bg-green-500 border border-green-600';
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center">
                <div className="w-40 text-sm font-medium text-muted-foreground">Projects</div>
                <div className="flex gap-1">
                    {weeks.map(day => (
                        <div key={day} className="w-8 text-center text-xs font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Heatmap Grid */}
            {heatmapProjects.map((project) => (
                <div key={project.name} className="flex items-center">
                    <div className="w-40 text-sm font-medium truncate pr-2" title={project.name}>
                        {project.name}
                    </div>
                    <div className="flex gap-1">
                        {project.data.map((intensity, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={`w-8 h-8 rounded ${getIntensityColor(intensity)} cursor-pointer hover:opacity-80 transition-opacity`}
                                title={`${project.name} - ${weeks[dayIndex]}: ${Math.round(intensity * 100)}% activity`}
                                onClick={() => {
                                    // Find the project and show its details
                                    const projectData = projects.find(p => p.name === project.name);
                                    if (projectData) {
                                        handleViewDetails(projectData);
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">Activity Level</div>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-2">Less</span>
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded ${getIntensityColor(intensity)}`}
                        />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">More</span>
                </div>
            </div>
        </div>
    );
};

const GanttChart = () => {
    const tasks = [
        { name: 'Foundation', start: 0, duration: 20, progress: 100 },
        { name: 'Structure', start: 15, duration: 30, progress: 75 },
        { name: 'Roofing', start: 35, duration: 15, progress: 30 },
        { name: 'Interiors', start: 45, duration: 25, progress: 0 },
    ];

    return (
        <div className="space-y-4">
            {tasks.map((task, index) => (
                <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">{task.name}</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="relative h-6 bg-gray-200 rounded">
                        <div
                            className="absolute h-full bg-blue-500 rounded"
                            style={{
                                left: `${(task.start / 70) * 100}%`,
                                width: `${(task.duration / 70) * 100}%`,
                                opacity: 0.7
                            }}
                        />
                        <div
                            className="absolute h-full bg-blue-600 rounded"
                            style={{
                                left: `${(task.start / 70) * 100}%`,
                                width: `${((task.progress / 100) * task.duration / 70) * 100}%`
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const DPRModal = ({ onClose, projects }) => {
    const [materials, setMaterials] = useState([{ material: '', qty: '', remarks: '' }]);
    const [form, setForm] = useState({
        projectId: '',
        workSections: '',
        manpower: '',
        manpowerRoles: '',
        equipmentUsed: '',
        safetyIncident: '',
        safetyDetails: '',
        qualityCheck: '',
        qualityDetails: '',
        delayIssue: '',
        delayDetails: '',
        subcontractor: '',
        workDone: '',
        weather: '',
        notes: '',
    });
    const [photos, setPhotos] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addMaterialRow = () => setMaterials([...materials, { material: '', qty: '', remarks: '' }]);
    const removeMaterialRow = (idx) => setMaterials(materials.filter((_, i) => i !== idx));
    const updateMaterial = (idx, field, value) => {
        setMaterials(materials.map((mat, i) => i === idx ? { ...mat, [field]: value } : mat));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        setPhotos(e.target.files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
            setForm({
                projectId: '',
                workSections: '',
                manpower: '',
                manpowerRoles: '',
                equipmentUsed: '',
                safetyIncident: '',
                safetyDetails: '',
                qualityCheck: '',
                qualityDetails: '',
                delayIssue: '',
                delayDetails: '',
                subcontractor: '',
                workDone: '',
                weather: '',
                notes: '',
            });
            setMaterials([{ material: '', qty: '', remarks: '' }]);
            setPhotos(null);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Submit Daily Progress Report</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Select Project</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            name="projectId"
                            value={form.projectId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a project</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name} - {project.location}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="workSections">Work Sections/Areas Covered</Label>
                        <Input id="workSections" name="workSections" placeholder="e.g. Foundation, Structure, Roofing" value={form.workSections} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="manpower">Manpower Deployed</Label>
                            <Input id="manpower" name="manpower" type="number" min="0" placeholder="Total number" value={form.manpower} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="manpowerRoles">Roles (comma separated)</Label>
                            <Input id="manpowerRoles" name="manpowerRoles" placeholder="e.g. Mason, Electrician, Supervisor" value={form.manpowerRoles} onChange={handleChange} required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="equipmentUsed">Equipment Used</Label>
                        <Input id="equipmentUsed" name="equipmentUsed" placeholder="e.g. Crane, Mixer, Scaffolding" value={form.equipmentUsed} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="safetyIncident">Any Safety Incidents?</Label>
                            <select name="safetyIncident" value={form.safetyIncident} onChange={handleChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select</option>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="safetyDetails">If Yes, Details</Label>
                            <Input id="safetyDetails" name="safetyDetails" placeholder="Describe incident (if any)" value={form.safetyDetails} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="qualityCheck">Quality Checks Performed?</Label>
                            <select name="qualityCheck" value={form.qualityCheck} onChange={handleChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="qualityDetails">If Yes, Details</Label>
                            <Input id="qualityDetails" name="qualityDetails" placeholder="Describe checks (if any)" value={form.qualityDetails} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="delayIssue">Any Delays/Issues?</Label>
                            <select name="delayIssue" value={form.delayIssue} onChange={handleChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select</option>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="delayDetails">If Yes, Details</Label>
                            <Input id="delayDetails" name="delayDetails" placeholder="Describe delay/issue (if any)" value={form.delayDetails} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <Label>Materials Consumed</Label>
                        <div className="space-y-2">
                            {materials.map((mat, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        name={`material${idx}`}
                                        placeholder="Material"
                                        className="text-xs"
                                        value={mat.material}
                                        onChange={e => updateMaterial(idx, 'material', e.target.value)}
                                        required
                                    />
                                    <Input
                                        name={`materialQty${idx}`}
                                        placeholder="Qty"
                                        className="text-xs"
                                        value={mat.qty}
                                        onChange={e => updateMaterial(idx, 'qty', e.target.value)}
                                        required
                                    />
                                    <Input
                                        name={`materialRemarks${idx}`}
                                        placeholder="Remarks"
                                        className="text-xs"
                                        value={mat.remarks}
                                        onChange={e => updateMaterial(idx, 'remarks', e.target.value)}
                                    />
                                    {materials.length > 1 && (
                                        <Button type="button" size="icon" variant="ghost" onClick={() => removeMaterialRow(idx)}>
                                            &times;
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addMaterialRow}>
                                Add Material Row
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="subcontractor">Subcontractor Activities</Label>
                        <Textarea id="subcontractor" name="subcontractor" placeholder="Describe any subcontractor work..." rows={2} value={form.subcontractor} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="workDone">Work Done Today</Label>
                        <Textarea
                            id="workDone"
                            name="workDone"
                            placeholder="Describe today's work progress..."
                            rows={4}
                            value={form.workDone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="weather">Weather Conditions</Label>
                        <select name="weather" value={form.weather} onChange={handleChange} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select weather</option>
                            <option value="clear">Clear</option>
                            <option value="rain">Rain</option>
                            <option value="wind">Windy</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="photos">Upload Photos</Label>
                        <Input
                            id="photos"
                            name="photos"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="notes">Site Engineer Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Additional notes or concerns..."
                            rows={3}
                            value={form.notes}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectsContent = () => {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    // Use UserFilter Context
    const {
        targetUserId,
        selectedUser,
        currentUser,
        setSelectedUserId
    } = useUserFilter();
    const userID = targetUserId || user?.id || ""

    // Function to get current tab from URL
    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('/overview')) return 'overview';
        if (path.includes('/list')) return 'list';
        if (path.includes('/milestone')) return 'milestone';
        return 'overview'; // default tab
    };

    // Handle tab changes
    const handleTabChange = (value: string) => {
        const tabRoutes: Record<string, string> = {
            overview: '/projects/overview',
            list: '/projects/list',
            milestone: '/projects/milestone'
        };
        navigate(tabRoutes[value]);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("overview");
    const [showDPRModal, setShowDPRModal] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
    const [projectType, setProjectType] = useState("");
    const [projects, setProjects] = useState([]);

    // Data for dropdowns
    const [clients, setClients] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    // Edit project states
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

    // Add subview state management
    const [subview, setSubview] = useState<'main' | 'activeProjects' | 'onSchedule' | 'budgetAnalysis' | 'alerts' | 'resourceAllocation' | 'materialStatus' | 'projectsOverview'>('main');
    const [newProject, setNewProject] = useState<Partial<Project>>({
        name: '',
        clientId: '',
        budget: 0,
        totalSpend: 0,
        deadline: '',
        location: '',
        manager: '',
        squareFootage: 0,
        startDate: '',
        estimatedDuration: 0,
        description: '',
        contractType: '',
        estimatedCost: 0,
        milestones: [],
        itemRate: '',
        withOrWithoutItem: false,
        costPlus: '',
        withOrWithoutCostPlus: false,
        coverArea: '',
        coverAreaUnit: '',
        withOrWithoutCoverArea: false,
        structuralConsultant: '',
        architecturalConsultants: ''
        // designDate: '',
        // foundationDate: '',
        // structureDate: '',
        // interiorDate: '',
        // finalDate: ''
    });

    const filteredProjects = projects.filter(
        project => project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleProjectDetails = (projectId: number) => {
        setExpandedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };



    const handleDeleteProject = async (projectId: number, projectName: string) => {
        if (!confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await axios.delete(`${API_URL}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });

            if (response.status === 204) {
                // Remove project from local state
                setProjects(prev => prev.filter(project => project.id !== projectId));

                toast({
                    title: "Project Deleted",
                    description: `"${projectName}" has been successfully deleted.`,
                });
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({
                title: "Delete Failed",
                description: "Failed to delete the project. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Function to handle edit project
    const handleEditProject = (project: any) => {
        // Set the editing project
        setEditingProject(project);

        // Pre-populate the form with existing project data
        setNewProject({
            name: project.name,
            clientId: project.clientId || (typeof project.client === 'object' ? project.client?.id || '' : ''),
            budget: project.budget,
            totalSpend: project.totalSpend,
            deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
            location: project.location,
            manager: project.manager ? (typeof project.manager === 'object' ? project.manager?.id || '' : project.manager) : '',
            squareFootage: project.squareFootage,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            estimatedDuration: project.estimatedDuration,
            description: project.description,
            contractType: project.contractType,
            estimatedCost: project.estimatedCost,
            milestones: project.milestones || [],
            itemRate: project.itemRate || '',
            withOrWithoutItem: project.withOrWithoutItem || false,
            costPlus: project.costPlus || '',
            withOrWithoutCostPlus: project.withOrWithoutCostPlus || false,
            coverArea: project.coverArea || '',
            coverAreaUnit: project.coverAreaUnit || '',
            withOrWithoutCoverArea: project.withOrWithoutCoverArea || false,
            structuralConsultant: project.structuralConsultant || '',
            architecturalConsultants: project.architecturalConsultants || ''
        });

        // Set project type if available
        if (project.projectType) {
            setProjectType(project.projectType);
        }

        // Open the project dialog
        setIsProjectDialogOpen(true);
    };

    // Function to update project
    const updateProject = async () => {
        if (!newProject.name || !newProject.clientId || !editingProject) {
            toast({
                title: "Missing Information",
                description: "Please fill in project name and client",
                variant: "destructive",
            });
            return;
        }

        if (!user?.id) {
            toast({
                title: "Authentication Error",
                description: "User not authenticated. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        setIsEditingProject(true);
        try {
            const projectData = {
                name: newProject.name,
                clientId: newProject.clientId,
                startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : editingProject.startDate,
                // Optional fields based on your form
                ...(newProject.location && { location: newProject.location }),
                ...(newProject.deadline && { deadline: new Date(newProject.deadline).toISOString() }),
                ...(newProject.budget && { budget: newProject.budget }),
                ...(newProject.manager && { managerId: newProject.manager }),
                ...(newProject.squareFootage && { squareFootage: newProject.squareFootage }),
                ...(newProject.estimatedDuration && { estimatedDuration: newProject.estimatedDuration }),
                ...(newProject.description && { description: newProject.description }),
                ...(newProject.contractType && { contractType: newProject.contractType }),
                ...(newProject.estimatedCost && { estimatedCost: newProject.estimatedCost }),
                ...(projectType && { projectType }),
                // Billing options
                ...(newProject.itemRate && { itemRate: newProject.itemRate }),
                ...(newProject.withOrWithoutItem !== undefined && { withOrWithoutItem: newProject.withOrWithoutItem }),
                ...(newProject.costPlus && { costPlus: newProject.costPlus }),
                ...(newProject.withOrWithoutCostPlus !== undefined && { withOrWithoutCostPlus: newProject.withOrWithoutCostPlus }),
                ...(newProject.coverArea && { coverArea: newProject.coverArea }),
                ...(newProject.coverAreaUnit && { coverAreaUnit: newProject.coverAreaUnit }),
                ...(newProject.withOrWithoutCoverArea !== undefined && { withOrWithoutCoverArea: newProject.withOrWithoutCoverArea }),
                // Consultants
                ...(newProject.structuralConsultant && { structuralConsultant: newProject.structuralConsultant }),
                ...(newProject.architecturalConsultants && { architecturalConsultants: newProject.architecturalConsultants }),
                // Include milestones if they exist
                ...(newProject.milestones && newProject.milestones.length > 0 && {
                    milestones: newProject.milestones.filter(m => m.name && m.startDate)
                })
            };

            const response = await axios.put(`${API_URL}/projects/${editingProject.id}`, projectData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                // Refresh projects list
                fetchProjects();

                // Reset form and editing state
                setNewProject({
                    name: '',
                    clientId: '',
                    budget: 0,
                    totalSpend: 0,
                    deadline: '',
                    location: '',
                    manager: '',
                    squareFootage: 0,
                    startDate: '',
                    estimatedDuration: 0,
                    description: '',
                    contractType: '',
                    estimatedCost: 0,
                    milestones: [],
                    itemRate: '',
                    withOrWithoutItem: false,
                    costPlus: '',
                    withOrWithoutCostPlus: false,
                    coverArea: '',
                    coverAreaUnit: '',
                    withOrWithoutCoverArea: false,
                    structuralConsultant: '',
                    architecturalConsultants: ''
                });
                setProjectType('');
                setEditingProject(null);
                setIsProjectDialogOpen(false);

                toast({
                    title: "Project Updated",
                    description: "The project has been successfully updated.",
                });
            }
        } catch (error) {
            console.error("Error updating project:", error);
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update the project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsEditingProject(false);
        }
    };

    const [selectedProjectForResources, setSelectedProjectForResources] = useState("");
    const [selectedResources, setSelectedResources] = useState([]);
    const [resourceAssignmentStartDate, setResourceAssignmentStartDate] = useState("");
    const [resourceAssignmentDuration, setResourceAssignmentDuration] = useState(1);
    const [resourceAssignmentNotes, setResourceAssignmentNotes] = useState("");
    const [isAssigningResources, setIsAssigningResources] = useState(false);

    // Sample available resources data
    const availableResources = [
        {
            id: 1,
            name: "Construction Crew A",
            type: "Labor",
            availability: "High",
            nextAvailable: "Immediate",
            dailyRate: 15000
        },
        {
            id: 2,
            name: "Crane Operator",
            type: "Equipment",
            availability: "Medium",
            nextAvailable: "Tomorrow",
            dailyRate: 25000
        },
        // Add more resources as needed
    ];


    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress':
                return 'bg-green-500 hover:bg-green-600';
            case 'Planning':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'Completed':
                return 'bg-green-700 hover:bg-green-800';
            case 'On Hold':
                return 'bg-amber-500 hover:bg-amber-600';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const [showProgressReportModal, setShowProgressReportModal] = useState(false);
    const [showSitePhotosModal, setShowSitePhotosModal] = useState(false);
    const [showResourceAssignmentModal, setShowResourceAssignmentModal] = useState(false);
    const [showSafetyAlertModal, setShowSafetyAlertModal] = useState(false);

    const generateTextReport = (project: any) => {
        return `
PROJECT STATUS REPORT
=====================

Project: ${project.name}
Location: ${project.location}
Client: ${project.client}
Status: ${project.status}
Manager: ${project.manager}

PROGRESS
--------
Completion: ${project.progress}%
Budget: ₹${project.spent.toLocaleString()} / ₹${project.budget.toLocaleString()}
Deadline: ${project.deadline}

MILESTONES
----------
${getMilestoneText(project)}

NOTES
-----
Add any additional notes here...
`;
    };

    const getMilestoneText = (project: any) => {
        const milestones = [
            { name: 'Design Approval', date: '2024-12-15', completed: true },
            { name: 'Foundation', date: '2025-02-20', completed: true },
            { name: 'Structure', date: '2025-05-30', completed: false },
            { name: 'Interiors', date: '2025-08-15', completed: false },
            { name: 'Final Inspection', date: project.deadline, completed: false }
        ];

        return milestones.map(m =>
            `${m.completed ? '✓' : '◻'} ${m.name} (${m.date})`
        ).join('\n');
    };

    const downloadTextFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const [heatmapProjects, setHeatmapProjects] = useState([]);

    // Helper function to get auth token
    const getToken = () => {
        return sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
    };

    // Fetch users for clients and managers
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });
            if (response.data) {
                // Filter clients (role === "client")
                // const clientUsers = response.data.filter((user: User) => user.role === 'client');
                // setClients(clientUsers);

                // Filter managers (roles that can manage projects)
                const managerUsers = response.data.filter((user: User) =>
                    ['admin', 'md', 'client_manager', 'site', 'project'].includes(user.role)
                );
                setManagers(managerUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            });
        }
    };

    const getClients = async () => {
        try {
            const response = await axios.get(`${API_URL}/clients`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });
            if (response.data) {
                setClients(response.data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast({
                title: "Error",
                description: "Failed to fetch clients",
                variant: "destructive",
            });
        }
    };


    // Function to create project
    const createProject = async () => {
        if (!newProject.name || !newProject.clientId) {
            toast({
                title: "Missing Information",
                description: "Please fill in project name and client",
                variant: "destructive",
            });
            return;
        }

        if (!user?.id) {
            toast({
                title: "Authentication Error",
                description: "User not authenticated. Please log in again.",
                variant: "destructive",
            });
            return;
        }

        setIsCreatingProject(true);
        try {
            const projectData = {
                name: newProject.name,
                clientId: newProject.clientId, // This should be the client ID
                startDate: newProject.startDate ? new Date(newProject.startDate).toISOString() : new Date().toISOString(),
                // Optional fields based on your form
                ...(newProject.location && { location: newProject.location }),
                ...(newProject.deadline && { deadline: new Date(newProject.deadline).toISOString() }),
                ...(newProject.budget && { budget: newProject.budget }),
                ...(newProject.manager && { managerId: newProject.manager }),
                ...(newProject.squareFootage && { squareFootage: newProject.squareFootage }),
                ...(newProject.estimatedDuration && { estimatedDuration: newProject.estimatedDuration }),
                ...(newProject.description && { description: newProject.description }),
                ...(newProject.contractType && { contractType: newProject.contractType }),
                ...(newProject.estimatedCost && { estimatedCost: newProject.estimatedCost }),
                ...(projectType && { projectType }),
                // Billing options
                ...(newProject.itemRate && { itemRate: newProject.itemRate }),
                ...(newProject.withOrWithoutItem !== undefined && { withOrWithoutItem: newProject.withOrWithoutItem }),
                ...(newProject.costPlus && { costPlus: newProject.costPlus }),
                ...(newProject.withOrWithoutCostPlus !== undefined && { withOrWithoutCostPlus: newProject.withOrWithoutCostPlus }),
                ...(newProject.coverArea && { coverArea: newProject.coverArea }),
                ...(newProject.coverAreaUnit && { coverAreaUnit: newProject.coverAreaUnit }),
                ...(newProject.withOrWithoutCoverArea !== undefined && { withOrWithoutCoverArea: newProject.withOrWithoutCoverArea }),
                // Consultants
                ...(newProject.structuralConsultant && { structuralConsultant: newProject.structuralConsultant }),
                ...(newProject.architecturalConsultants && { architecturalConsultants: newProject.architecturalConsultants }),
                // Include milestones if they exist
                ...(newProject.milestones && newProject.milestones.length > 0 && {
                    milestones: newProject.milestones.filter(m => m.name && m.startDate)
                })
            };

            const response = await axios.post(`${API_URL}/projects/user/${selectedUser?.id || user.id}`, projectData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                // Refresh projects list
                fetchProjects();

                // Reset form
                setNewProject({
                    name: '',
                    clientId: '',
                    budget: 0,
                    totalSpend: 0,
                    deadline: '',
                    location: '',
                    manager: '',
                    squareFootage: 0,
                    startDate: '',
                    estimatedDuration: 0,
                    description: '',
                    contractType: '',
                    estimatedCost: 0,
                    milestones: [],
                    itemRate: '',
                    withOrWithoutItem: false,
                    costPlus: '',
                    withOrWithoutCostPlus: false,
                    coverArea: '',
                    coverAreaUnit: '',
                    withOrWithoutCoverArea: false,
                    structuralConsultant: '',
                    architecturalConsultants: ''
                });
                setProjectType('');
                setIsProjectDialogOpen(false);

                toast({
                    title: "Project Created",
                    description: `${response.data.name} has been created successfully`,
                });
            }
        } catch (error) {
            console.error('Error creating project:', error);
            toast({
                title: "Error",
                description: "Failed to create project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    // Function to fetch projects
    const fetchProjects = async () => {
        // if (!userID) return; // Don't fetch if no user ID
        try {
            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            console.log("Fetching projects for user:", userID);
            const endpoint =
                ((user?.role === "admin" || user?.role === "md") ? selectedUser?.id == currentUser?.id : (user?.role === "admin" || user?.role === "md"))
                    ? `${API_URL}/projects`
                    : `${API_URL}/projects/user/${userID}`;

            const response = await axios.get(endpoint, { headers });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Auto-reset on page change
    useEffect(() => {
        // Reset to current user on page load/change
        setSelectedUserId(null);
    }, []); // Empty dependency - runs once on mount

    // Use effect to fetch data when targetUserId changes
    useEffect(() => {
        if (userID) {
            fetchProjects();
        }
    }, [userID]); // Refetch when target user changes

    useEffect(() => {
        fetchUsers();
        getClients();
        fetchProjects();

        // Fetch heatmap data if needed
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        axios.get(`${API_URL}/projects/activity`, { headers })
            .then(res => setHeatmapProjects(res.data))
            .catch(() => { });
    }, []);


    return (
        <div className="space-y-4">
            {/* User Filter Component */}
            <UserFilterComponent />

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Project Management
                        {selectedUser && selectedUser.id !== currentUser?.id && (
                            <span className="text-lg text-muted-foreground ml-2">
                                - {selectedUser.name}
                            </span>
                        )}
                    </h1>
                    <p className="text-muted-foreground">Manage all your construction projects in one place</p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* <Button onClick={() => setShowDPRModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Camera className="mr-2 h-4 w-4" />
                        Submit DPR
                    </Button> */}
                    <Button onClick={() => setIsProjectDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                    <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
                        setIsProjectDialogOpen(open);
                        if (!open) {
                            // Clear editing state when dialog closes
                            setEditingProject(null);
                            setProjectType('');
                            setNewProject({
                                name: '',
                                clientId: '',
                                budget: 0,
                                totalSpend: 0,
                                deadline: '',
                                location: '',
                                manager: '',
                                squareFootage: 0,
                                startDate: '',
                                estimatedDuration: 0,
                                description: '',
                                contractType: '',
                                estimatedCost: 0,
                                milestones: [],
                                itemRate: '',
                                withOrWithoutItem: false,
                                costPlus: '',
                                withOrWithoutCostPlus: false,
                                coverArea: '',
                                coverAreaUnit: '',
                                withOrWithoutCoverArea: false,
                                structuralConsultant: '',
                                architecturalConsultants: ''
                            });
                        }
                    }}>
                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    {editingProject ? 'Edit Project' : 'Create New Project'}
                                </DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new construction project with key milestones
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 py-4 px-4 overflow-y-auto flex-1">
                                {/* Basic Project Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold border-b pb-2">Project Information</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="project-name">Project Name</Label>
                                        <Input
                                            id="project-name"
                                            placeholder="Enter project name"
                                            value={newProject.name || ''}
                                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="client">Client *</Label>
                                            <Select
                                                value={newProject.clientId || ''}
                                                onValueChange={(value) => setNewProject({ ...newProject, clientId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a client" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name} ({client.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="budget">Order Value (₹)</Label>
                                            <Input
                                                id="budget"
                                                type="number"
                                                placeholder="Enter order value"
                                                value={newProject.budget || ''}
                                                onChange={(e) => setNewProject({ ...newProject, budget: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <Input
                                                id="location"
                                                placeholder="Enter project location"
                                                value={newProject.location || ''}
                                                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="manager">Project Manager</Label>
                                            <Select
                                                value={newProject.manager || ''}
                                                onValueChange={(value) => setNewProject({ ...newProject, manager: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a project manager" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {managers.map((manager) => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            {manager.name} ({manager.role})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Project Deadline *</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={newProject.deadline || ''}
                                            onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="projectStartDate">Project Start Date</Label>
                                            <Input
                                                id="projectStartDate"
                                                type="date"
                                                value={newProject.startDate || ''}
                                                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                                            <Input
                                                id="estimatedDuration"
                                                type="number"
                                                placeholder="Enter duration in days"
                                                value={newProject.estimatedDuration || ''}
                                                onChange={(e) => setNewProject({ ...newProject, estimatedDuration: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="estimatedCost">Estimated Cost (₹)</Label>
                                            <Input
                                                id="estimatedCost"
                                                type="number"
                                                placeholder="Enter estimated cost"
                                                value={newProject.estimatedCost || ''}
                                                onChange={(e) => setNewProject({ ...newProject, estimatedCost: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contractType">Contract Type</Label>
                                            <Select
                                                value={newProject.contractType || ''}
                                                onValueChange={(value) => setNewProject({ ...newProject, contractType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select contract type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                                                    <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
                                                    <SelectItem value="TIME_AND_MATERIALS">Time and Materials</SelectItem>
                                                    <SelectItem value="UNIT_PRICE">Unit Price</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter project description..."
                                            value={newProject.description || ''}
                                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="structuralConsultant">Structural Consultant</Label>
                                            <Input
                                                id="structuralConsultant"
                                                placeholder="Enter structural consultant name"
                                                value={newProject.structuralConsultant || ''}
                                                onChange={(e) => setNewProject({ ...newProject, structuralConsultant: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="architecturalConsultants">Architectural Consultants</Label>
                                            <Input
                                                id="architecturalConsultants"
                                                placeholder="Enter architectural consultants name"
                                                value={newProject.architecturalConsultants || ''}
                                                onChange={(e) => setNewProject({ ...newProject, architecturalConsultants: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Project Type</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Residential', 'Commercial', 'Industrial', 'Infrastructure'].map((type) => (
                                                <Button
                                                    key={type}
                                                    variant={projectType === type.toUpperCase() ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setProjectType(type.toUpperCase())}
                                                >
                                                    {type}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Billing Options Section */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="text-sm font-semibold">Billing Options</h4>

                                        {/* Item Rate Input Field */}
                                        <div className="space-y-2 border rounded-lg p-4">
                                            <Label htmlFor="itemRate" className="font-semibold">Item Rate</Label>
                                            <Input
                                                id="itemRate"
                                                type="text"
                                                placeholder="Enter item rate value"
                                                value={newProject.itemRate || ''}
                                                onChange={(e) => setNewProject({ ...newProject, itemRate: e.target.value })}
                                            />
                                            {/* Material Options for Item Rate */}
                                            <div className="space-y-2 mt-3 border-t pt-3">
                                                <Label className="text-xs font-medium text-gray-600">Select Material Option</Label>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="itemRateWithMaterial"
                                                            checked={newProject.withOrWithoutItem === true || false}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutItem: true });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutItem: false });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="itemRateWithMaterial" className="font-normal cursor-pointer text-sm">With Material</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="itemRateWithoutMaterial"
                                                            checked={newProject.withOrWithoutItem === false || false}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutItem: false });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutItem: undefined });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="itemRateWithoutMaterial" className="font-normal cursor-pointer text-sm">Without Material</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Plus Input Field */}
                                        <div className="space-y-2 border rounded-lg p-4">
                                            <Label htmlFor="costPlus" className="font-semibold">Cost Plus</Label>
                                            <Input
                                                id="costPlus"
                                                type="text"
                                                placeholder="Enter cost plus value"
                                                value={newProject.costPlus || ''}
                                                onChange={(e) => setNewProject({ ...newProject, costPlus: e.target.value })}
                                            />
                                            {/* Material Options for Cost Plus */}
                                            <div className="space-y-2 mt-3 border-t pt-3">
                                                <Label className="text-xs font-medium text-gray-600">Select Material Option</Label>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="costPlusWithMaterial"
                                                            checked={newProject.withOrWithoutCostPlus === true || false}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutCostPlus: true });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutCostPlus: false });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="costPlusWithMaterial" className="font-normal cursor-pointer text-sm">With Material</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="costPlusWithoutMaterial"
                                                            checked={newProject.withOrWithoutCostPlus === false || false}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutCostPlus: false });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutCostPlus: undefined });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="costPlusWithoutMaterial" className="font-normal cursor-pointer text-sm">Without Material</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cover Area Input Field */}
                                        <div className="space-y-2 border rounded-lg p-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <Label htmlFor="coverArea" className="font-semibold">Cover Area</Label>
                                                    <Input
                                                        id="coverArea"
                                                        type="text"
                                                        placeholder="Enter cover area value"
                                                        value={newProject.coverArea || ''}
                                                        onChange={(e) => setNewProject({ ...newProject, coverArea: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label htmlFor="coverAreaUnit" className="font-semibold">Unit</Label>
                                                    <Select
                                                        value={newProject.coverAreaUnit || ''}
                                                        onValueChange={(value) => setNewProject({ ...newProject, coverAreaUnit: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="square_foot">Square Foot</SelectItem>
                                                            <SelectItem value="square_meter">Square Meter</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            {/* Material Options for Cover Area */}
                                            <div className="space-y-2 mt-3 border-t pt-3">
                                                <Label className="text-xs font-medium text-gray-600">Select Material Option</Label>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="coverAreaWithMaterial"
                                                            checked={newProject.withOrWithoutCoverArea === true}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutCoverArea: true });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutCoverArea: false });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="coverAreaWithMaterial" className="font-normal cursor-pointer text-sm">With Material</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="coverAreaWithoutMaterial"
                                                            checked={newProject.withOrWithoutCoverArea === false}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setNewProject({ ...newProject, withOrWithoutCoverArea: false });
                                                                } else {
                                                                    setNewProject({ ...newProject, withOrWithoutCoverArea: false });
                                                                }
                                                            }}
                                                            className="rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="coverAreaWithoutMaterial" className="font-normal cursor-pointer text-sm">Without Material</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="space-y-2">
                                        <Label>Project Status</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Planning', 'In Progress', 'On Hold'].map((status) => (
                                                <Button
                                                    key={status}
                                                    variant={newProject.status === status ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setNewProject({ ...newProject, status })}
                                                >
                                                    {status}
                                                </Button>
                                            ))}
                                        </div>
                                    </div> */}
                                </div>

                                {/* Key Milestones Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold border-b pb-2 flex-1">Key Milestones</h3>
                                        <div className="flex flex-row gap-2 ml-4">
                                            <Button
                                                onClick={() => {
                                                    const newMilestone = {
                                                        id: Date.now(),
                                                        name: '',
                                                        startDate: '',
                                                        endDate: ''
                                                    };
                                                    setNewProject(prev => ({
                                                        ...prev,
                                                        milestones: [...(prev.milestones || []), newMilestone]
                                                    }));
                                                }}
                                                size="sm"
                                                variant="outline"
                                                type="button"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Row
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg overflow-x-auto">
                                        <div className="min-w-full">
                                            {/* Header */}
                                            <div className="bg-muted/50 border-b px-4 py-3">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-1 text-sm font-medium">No.</div>
                                                    <div className="col-span-4 text-sm font-medium">Milestone Name</div>
                                                    <div className="col-span-3 text-sm font-medium">Start Date</div>
                                                    <div className="col-span-3 text-sm font-medium">End Date</div>
                                                    <div className="col-span-1"></div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="divide-y">
                                                {(newProject.milestones && newProject.milestones.length > 0) ? (
                                                    newProject.milestones.map((milestone, index) => (
                                                        <div key={milestone.id} className="px-4 py-3">
                                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                                <div className="col-span-1 text-sm font-medium">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="col-span-4">
                                                                    <Input
                                                                        value={milestone.name}
                                                                        onChange={(e) => {
                                                                            const updatedMilestones = [...(newProject.milestones || [])];
                                                                            updatedMilestones[index] = { ...milestone, name: e.target.value };
                                                                            setNewProject(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                        }}
                                                                        placeholder="Enter milestone name"
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <Input
                                                                        type="date"
                                                                        value={milestone.startDate}
                                                                        onChange={(e) => {
                                                                            const updatedMilestones = [...(newProject.milestones || [])];
                                                                            updatedMilestones[index] = { ...milestone, startDate: e.target.value };
                                                                            setNewProject(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                        }}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <Input
                                                                        type="date"
                                                                        value={milestone.endDate}
                                                                        onChange={(e) => {
                                                                            const updatedMilestones = [...(newProject.milestones || [])];
                                                                            updatedMilestones[index] = { ...milestone, endDate: e.target.value };
                                                                            setNewProject(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                        }}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1">
                                                                    <Button
                                                                        onClick={() => {
                                                                            const updatedMilestones = newProject.milestones?.filter((_, i) => i !== index) || [];
                                                                            setNewProject(prev => ({ ...prev, milestones: updatedMilestones }));
                                                                        }}
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        type="button"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-muted-foreground">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <p>No milestones added yet</p>
                                                            <Button
                                                                onClick={() => {
                                                                    const newMilestone = {
                                                                        id: Date.now(),
                                                                        name: '',
                                                                        startDate: '',
                                                                        endDate: ''
                                                                    };
                                                                    setNewProject(prev => ({
                                                                        ...prev,
                                                                        milestones: [...(prev.milestones || []), newMilestone]
                                                                    }));
                                                                }}
                                                                size="sm"
                                                                variant="outline"
                                                                type="button"
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add First Milestone
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setNewProject({
                                            name: '',
                                            clientId: '',
                                            budget: 0,
                                            totalSpend: 0,
                                            deadline: '',
                                            location: '',
                                            manager: '',
                                            squareFootage: 0,
                                            startDate: '',
                                            estimatedDuration: 0,
                                            description: '',
                                            contractType: '',
                                            estimatedCost: 0,
                                            milestones: [],
                                            itemRate: '',
                                            withOrWithoutItem: false,
                                            costPlus: '',
                                            withOrWithoutCostPlus: false,
                                            coverArea: '',
                                            coverAreaUnit: '',
                                            withOrWithoutCoverArea: false,
                                            structuralConsultant: '',
                                            architecturalConsultants: ''
                                        });
                                        setProjectType('');
                                        setEditingProject(null);
                                        setIsProjectDialogOpen(false);
                                    }}
                                    disabled={isCreatingProject || isEditingProject}
                                >
                                    {editingProject ? 'Cancel' : 'Clear'}
                                </Button>
                                <Button
                                    onClick={editingProject ? updateProject : createProject}
                                    disabled={!newProject.name || !newProject.clientId || !newProject.location || !newProject.deadline || isCreatingProject || isEditingProject}
                                    className="flex-1"
                                >
                                    {(isCreatingProject || isEditingProject) ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {editingProject ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            {editingProject ? (
                                                <>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Update Project
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Project
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
                {/* <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="milestone">Milestone</TabsTrigger>
                </TabsList> */}

                <TabsContent value="overview" className="space-y-6">
                    {subview === 'main' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Projects"
                                value={projects.length}
                                icon={Building}
                                trend={{
                                    value: projects.length > 0 ? Math.round((projects.length / (projects.length || 1)) * 100) : 0,
                                    label: "active projects"
                                }}
                                onClick={() => setSubview('projectsOverview')}
                            />
                            <StatCard
                                title="Total Budget"
                                value={`₹${(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 10000000).toFixed(2)}Cr`}
                                icon={TrendingUp}
                                trend={{
                                    value: Math.round((projects.reduce((sum, p) => sum + (p.budget || 0), 0) / (projects.length || 1)) / 1000000),
                                    label: "avg per project"
                                }}
                                onClick={() => setSubview('budgetAnalysis')}
                            />
                            <StatCard
                                title="Total Spent"
                                value={`₹${(projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0) / 10000000).toFixed(2)}Cr`}
                                icon={AlertTriangle}
                                trend={{
                                    value: Math.round(((projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0)) / (projects.reduce((sum, p) => sum + (p.budget || 0), 0) || 1)) * 100),
                                    label: "of total budget"
                                }}
                                onClick={() => setSubview('budgetAnalysis')}
                            />
                            <StatCard
                                title="Remaining Budget"
                                value={`₹${(Math.max(0, projects.reduce((sum, p) => sum + ((p.budget || 0) - (p.totalSpend || 0)), 0)) / 10000000).toFixed(2)}Cr`}
                                icon={Calendar}
                                trend={{
                                    value: Math.round((Math.max(0, projects.reduce((sum, p) => sum + ((p.budget || 0) - (p.totalSpend || 0)), 0)) / (projects.reduce((sum, p) => sum + (p.budget || 0), 0) || 1)) * 100),
                                    label: "left to spend"
                                }}
                                onClick={() => setSubview('budgetAnalysis')}
                            />
                        </div>
                    )}

                    {subview === 'main' && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Projects</CardTitle>
                                <CardDescription>
                                    View and manage all your projects
                                </CardDescription>

                                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search projects..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon">
                                            <Filter className="h-4 w-4" />
                                        </Button>

                                        <Tabs defaultValue="overview" className="w-auto" onValueChange={(v) => setView(v)}>
                                            <TabsList>
                                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                                <TabsTrigger value="list">List</TabsTrigger>
                                                <TabsTrigger value="milestone">Milestone</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>


                                {view === "list" && (
                                    <div className="space-y-4">
                                        {/* Mobile Cards View */}
                                        <div className="block md:hidden space-y-4">
                                            {filteredProjects.map((project) => (
                                                <Card key={project.id} className="p-4">
                                                    <div className="space-y-3">
                                                        {/* Project Name and Client */}
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{project.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}
                                                            </p>
                                                        </div>

                                                        {/* Key Info Grid */}
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">Manager:</span>
                                                                <p className="font-medium truncate">
                                                                    {typeof project.managers === 'object' ? project.managers?.name || 'Unassigned' : project.managers || 'Unassigned'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Location:</span>
                                                                <p className="font-medium truncate">{project.location}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Start Date:</span>
                                                                <p className="font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Deadline:</span>
                                                                <p className="font-medium">{new Date(project.deadline).toLocaleDateString('en-IN')}</p>
                                                            </div>
                                                        </div>

                                                        {/* Budget Info */}
                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <div>
                                                                <span className="text-xs text-muted-foreground">Budget:</span>
                                                                <p className="font-semibold">₹{(project.budget || 0).toLocaleString()}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs text-muted-foreground">Spent:</span>
                                                                <p className="font-semibold">₹{(project.totalSpend || 0).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block rounded-md border overflow-x-auto">
                                            <table className="w-full caption-bottom text-sm">
                                                <thead>
                                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap">Name</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap">Client</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap hidden lg:table-cell">Manager</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap">Start Date</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap">Deadline</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap">Budget</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap hidden xl:table-cell">Spent</th>
                                                        <th className="h-12 px-4 text-left align-middle font-medium whitespace-nowrap hidden lg:table-cell">Location</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProjects.map((project) => (
                                                        <tr
                                                            key={project.id}
                                                            className="border-b transition-colors hover:bg-muted/50"
                                                        >
                                                            <td className="p-4 align-middle font-medium max-w-[200px]">
                                                                <div className="truncate" title={project.name}>
                                                                    {project.name}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-middle max-w-[150px]">
                                                                <div className="truncate" title={typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}>
                                                                    {typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-middle hidden lg:table-cell max-w-[150px]">
                                                                <div className="truncate" title={typeof project.managers === 'object' ? project.managers?.name || 'Unknown managers' : project.managers}>
                                                                    {typeof project.managers === 'object' ? project.managers?.name || 'Unassigned' : project.managers || 'Unassigned'}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 align-middle whitespace-nowrap">
                                                                {new Date(project.startDate).toLocaleDateString('en-IN')}
                                                            </td>
                                                            <td className="p-4 align-middle whitespace-nowrap">
                                                                {new Date(project.deadline).toLocaleDateString('en-IN')}
                                                            </td>
                                                            <td className="p-4 align-middle whitespace-nowrap">
                                                                ₹{((project.budget || 0) / 100000).toFixed(1)}L
                                                            </td>
                                                            <td className="p-4 align-middle hidden xl:table-cell whitespace-nowrap">
                                                                ₹{((project.totalSpend || 0) / 100000).toFixed(1)}L
                                                            </td>
                                                            <td className="p-4 align-middle hidden lg:table-cell max-w-[120px]">
                                                                <div className="truncate" title={project.location}>
                                                                    {project.location}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Empty State */}
                                        {filteredProjects.length === 0 && (
                                            <div className="text-center py-12">
                                                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                                                <p className="text-gray-500">No projects found matching your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {view === "milestone" && (
                                    <div className="mt-6 space-y-6">
                                        {filteredProjects.map((project) => (
                                            <Card key={project.id} className="hover:shadow-md transition-shadow overflow-hidden">
                                                <CardHeader className="border-b">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                                                            <CardDescription className="mt-1">
                                                                {typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client} • {project.location}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    {project.milestones && project.milestones.length > 0 ? (
                                                        <div className="divide-y">
                                                            {project.milestones.map((milestone, index) => (
                                                                <div
                                                                    key={milestone.id || index}
                                                                    className="p-4 hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                                        <div className="flex-1 space-y-3">
                                                                            <h4 className="font-medium text-base">{milestone.name}</h4>

                                                                            <div className="grid grid-cols-2 gap-4 justify-centre">
                                                                                <div className="space-y-1">
                                                                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                                                                    <p className="font-medium">
                                                                                        {new Date(milestone.startDate).toLocaleDateString('en-IN', {
                                                                                            day: 'numeric',
                                                                                            month: 'short',
                                                                                            year: 'numeric'
                                                                                        })}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <p className="text-sm text-muted-foreground">End Date</p>
                                                                                    <p className="font-medium">
                                                                                        {milestone.endDate ?
                                                                                            new Date(milestone.endDate).toLocaleDateString('en-IN', {
                                                                                                day: 'numeric',
                                                                                                month: 'short',
                                                                                                year: 'numeric'
                                                                                            }) :
                                                                                            <span className="text-muted-foreground">Pending</span>
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-muted-foreground">
                                                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                            <p className="text-gray-500">No milestones defined for this project</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {filteredProjects.length === 0 && (
                                            <div className="text-center py-12">
                                                <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
                                                <p className="text-gray-500">No projects found matching your search criteria</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {view === "kanban" && (
                                    <div className="mt-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                            {["Planning", "In Progress", "On Hold", "Completed"].map((status) => (
                                                <div key={status} className="rounded-lg border bg-card">
                                                    <div className="p-3 border-b font-medium">{status}</div>
                                                    <div className="p-2 space-y-2">
                                                        {filteredProjects
                                                            .filter(project => project.status === status)
                                                            .map(project => (
                                                                <div key={project.id} className="rounded-md border p-3 bg-background hover:shadow transition-all">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex-1 cursor-pointer" onClick={() => toggleProjectDetails(project.id)}>
                                                                            <div className="font-medium">{project.name}</div>
                                                                            <div className="text-xs text-muted-foreground">{typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}</div>
                                                                        </div>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteProject(project.id, project.name);
                                                                            }}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                                        <MapPin className="h-3 w-3 mr-1" />
                                                                        {project.location}
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="h-1.5 w-full bg-secondary rounded-full">
                                                                                <div
                                                                                    className="h-full bg-primary rounded-full"
                                                                                    style={{ width: `${project.progress}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs w-9 text-right">{project.progress}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {view === "timeline" && (
                                    <div className="mt-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Project Timeline</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <GanttChart />
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {view === "overview" && (
                                    <div className="mt-4 space-y-6">
                                        {/* <Card>
                                    <CardHeader>
                                        <CardTitle>Project Progress Heatmap</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ProjectHeatmap projects={projects} handleViewDetails={handleViewDetails} />
                                    </CardContent>
                                </Card> */}

                                        <div className="space-y-6">
                                            {filteredProjects.map((project) => (
                                                <Card key={project.id} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-0">
                                                        {/* Main project header - always visible */}
                                                        <div className="p-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="p-0 h-8 w-8"
                                                                        onClick={() => toggleProjectDetails(project.id)}
                                                                    >
                                                                        {expandedProjects.has(project.id) ? (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                    <div>
                                                                        <div className="font-semibold">{project.name}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client} • {project.location}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="text-right">
                                                                        <div className="font-semibold">
                                                                            ₹{((project.budget || 0) / 100000).toFixed(1)}L
                                                                        </div>
                                                                        {/* <div className="text-sm text-muted-foreground">
                                                                    {project.progress}% Complete
                                                                </div> */}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                                                                            onClick={() => handleEditProject(project)}
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                                            onClick={() => handleDeleteProject(project.id, project.name)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expandable project details */}
                                                        {expandedProjects.has(project.id) && (
                                                            <div className="border-t bg-muted/50 p-6">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                    {/* Project Information */}
                                                                    <div>
                                                                        <h4 className="font-medium mb-3">Project Details</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            <div className="flex items-center">
                                                                                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Manager:</span>
                                                                                <span className="ml-1 font-medium">
                                                                                    {(() => {
                                                                                        if (typeof project.manager === 'object' && project.manager?.name) {
                                                                                            return project.manager.name;
                                                                                        }
                                                                                        if (typeof project.manager === 'string') {
                                                                                            return project.manager;
                                                                                        }
                                                                                        if (project.managers?.name) {
                                                                                            return project.managers.name;
                                                                                        }
                                                                                        return 'Not assigned';
                                                                                    })()}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Deadline:</span>
                                                                                <span className="ml-1 font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'Not set'}</span>
                                                                            </div>
                                                                            {project.startDate && (
                                                                                <div className="flex items-center">
                                                                                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                    <span className="text-muted-foreground">Start Date:</span>
                                                                                    <span className="ml-1 font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</span>
                                                                                </div>

                                                                            )}
                                                                            {project.estimatedDuration && (
                                                                                <div className="flex items-center">
                                                                                    <Calendar1Icon className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                    <span className="text-muted-foreground">Estimated Duration:</span>
                                                                                    <span className="ml-1 font-medium">{project.estimatedDuration}</span>
                                                                                </div>

                                                                            )}
                                                                            <div className="flex items-center">
                                                                                <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Location:</span>
                                                                                <span className="ml-1 font-medium">{project.location}</span>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Project Type:</span>
                                                                                <span className="ml-1 font-medium">{project.projectType}</span>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <Building className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Structural Consultant:</span>
                                                                                <span className="ml-1 font-medium">{project.structuralConsultant || 'N/A'}</span>
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <Building className="h-4 w-4 text-muted-foreground mr-2" />
                                                                                <span className="text-muted-foreground">Architectural Consultants:</span>
                                                                                <span className="ml-1 font-medium">{project.architecturalConsultants || 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Budget & Progress */}
                                                                    <div>
                                                                        <h4 className="font-medium mb-3">Financial Overview</h4>
                                                                        <div className="space-y-3">
                                                                            <div>
                                                                                <div className="text-sm mb-1">
                                                                                    <span className="text-muted-foreground">Order Value:</span>
                                                                                    <span className="ml-2 font-medium">{project.budget}</span>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            {/* <div>
                                                                                <div className="text-sm mb-1">
                                                                                    <span className="text-muted-foreground">Spent:</span>
                                                                                    <span className="ml-2 font-medium">{project.totalSpend}</span>
                                                                                </div>
                                                                            </div> */}
                                                                            <div>
                                                                                <div className="text-sm mb-1">
                                                                                    <span className="text-muted-foreground">Estimated Cost:</span>
                                                                                    <span className="ml-2 font-medium">{project.estimatedCost}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Contract Pricing Details */}
                                                                    <div>
                                                                        <h4 className="font-medium mb-3">Contract Pricing</h4>
                                                                        <div className="space-y-2 text-sm">
                                                                            {project.itemRate && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Item Rate:</span>
                                                                                    <span className="ml-2 font-medium">{project.itemRate}</span>
                                                                                    {project.withOrWithoutItem && (
                                                                                        <Badge variant="outline" className="ml-2 text-xs">With Material</Badge>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            {project.costPlus && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Cost Plus:</span>
                                                                                    <span className="ml-2 font-medium">{project.costPlus}</span>
                                                                                    {project.withOrWithoutCostPlus && (
                                                                                        <Badge variant="outline" className="ml-2 text-xs">With Material</Badge>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            {project.coverArea && (
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Cover Area:</span>
                                                                                    <span className="ml-2 font-medium">{project.coverArea} {project.coverAreaUnit || ''}</span>
                                                                                    {project.withOrWithoutCoverArea && (
                                                                                        <Badge variant="outline" className="ml-2 text-xs">With Material</Badge>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                            {!project.itemRate && !project.costPlus && !project.coverArea && (
                                                                                <div className="text-muted-foreground text-xs">No pricing details added</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}



                                {view === "resources" && (
                                    <div className="mt-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Resource Allocation</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {['Engineers', 'Workers', 'Supervisors', 'Equipment'].map((resource, index) => (
                                                            <div key={resource} className="flex justify-between items-center">
                                                                <span className="text-sm font-medium">{resource}</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <Progress value={[85, 70, 90, 60][index]} className="w-20 h-2" />
                                                                    <span className="text-sm text-muted-foreground">{[85, 70, 90, 60][index]}%</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Material Status</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {[
                                                            { name: 'Cement', status: 'Available', quantity: '150 bags' },
                                                            { name: 'Steel Bars', status: 'Low Stock', quantity: '25 tons' },
                                                            { name: 'Bricks', status: 'Available', quantity: '50,000 units' },
                                                            { name: 'Sand', status: 'Critical', quantity: '10 cubic meters' }
                                                        ].map((material) => (
                                                            <div key={material.name} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                                <div>
                                                                    <p className="font-medium">{material.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{material.quantity}</p>
                                                                </div>
                                                                <Badge
                                                                    variant={material.status === 'Critical' ? 'destructive' :
                                                                        material.status === 'Low Stock' ? 'outline' : 'default'}
                                                                >
                                                                    {material.status}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}

                                {view === "reports" && (
                                    <div className="mt-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <Card className="lg:col-span-2">
                                                <CardHeader>
                                                    <CardTitle>Recent DPR Submissions</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {[
                                                            { project: 'Residential Complex A', date: '2025-08-10', status: 'Approved', progress: '65%' },
                                                            { project: 'Office Tower B', date: '2025-08-09', status: 'Pending', progress: '30%' },
                                                            { project: 'Shopping Mall C', date: '2025-08-08', status: 'Approved', progress: '85%' }
                                                        ].map((dpr, index) => (
                                                            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                                                <div>
                                                                    <p className="font-medium">{dpr.project}</p>
                                                                    <p className="text-sm text-muted-foreground">{dpr.date}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <Badge variant={dpr.status === 'Approved' ? 'default' : 'outline'}>
                                                                        {dpr.status}
                                                                    </Badge>
                                                                    <p className="text-sm text-muted-foreground mt-1">Progress: {dpr.progress}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Quick Actions</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <Button
                                                            className="w-full justify-start"
                                                            variant="outline"
                                                            onClick={() => setShowProgressReportModal(true)}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Generate Progress Report
                                                        </Button>
                                                        <Button
                                                            className="w-full justify-start"
                                                            variant="outline"
                                                            onClick={() => setShowSitePhotosModal(true)}
                                                        >
                                                            <Camera className="h-4 w-4 mr-2" />
                                                            Upload Site Photos
                                                        </Button>
                                                        <Button
                                                            className="w-full justify-start"
                                                            variant="outline"
                                                            onClick={() => setShowResourceAssignmentModal(true)}
                                                        >
                                                            <Users className="h-4 w-4 mr-2" />
                                                            Assign Resources
                                                        </Button>
                                                        <Button
                                                            className="w-full justify-start"
                                                            variant="outline"
                                                            onClick={() => setShowSafetyAlertModal(true)}
                                                        >
                                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                                            Create Safety Alert
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Active Projects Subview */}
                    {subview === 'activeProjects' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Active Projects</CardTitle>
                                        <CardDescription>Projects currently in progress</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projects.filter(p => p.status === "In Progress").map((project) => (
                                        <div key={project.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{project.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{project.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{typeof project.manager === 'object' ? project.manager?.name : project.manager || 'Not assigned'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium">{project.progress}%</span>
                                                        <Badge variant="secondary">{project.status}</Badge>
                                                    </div>
                                                    <Progress value={project.progress} className="w-32" />
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Due: {new Date(project.deadline).toLocaleDateString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* On Schedule Projects Subview */}
                    {subview === 'onSchedule' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Projects On Schedule</CardTitle>
                                        <CardDescription>Projects meeting their timeline expectations</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projects.filter(p => p.status === "In Progress" && p.progress >= 50).map((project) => (
                                        <div key={project.id} className="p-4 border rounded-lg border-green-200 bg-green-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-green-800">{project.name}</h3>
                                                    <p className="text-sm text-green-600">{typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm text-green-700">Due: {new Date(project.deadline).toLocaleDateString('en-IN')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm text-green-700">
                                                                {(() => {
                                                                    if (typeof project.manager === 'object' && project.manager?.name) {
                                                                        return project.manager.name;
                                                                    }
                                                                    if (typeof project.manager === 'string') {
                                                                        return project.manager;
                                                                    }
                                                                    if (project.managers?.name) {
                                                                        return project.managers.name;
                                                                    }
                                                                    return 'Not assigned';
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-green-800">{project.progress}%</span>
                                                        <Badge variant="default" className="bg-green-600">On Track</Badge>
                                                    </div>
                                                    <Progress value={project.progress} className="w-32" />
                                                    <p className="text-sm text-green-600 mt-1">
                                                        Budget: ₹{(project.budget / 1000000).toFixed(1)}M
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Budget Analysis Subview */}
                    {subview === 'budgetAnalysis' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Budget Analysis</CardTitle>
                                        <CardDescription>Financial overview of all projects</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Budget Utilization</h3>
                                        {projects.map((project) => {
                                            const utilization = (project.totalSpend / project.budget) * 100;
                                            return (
                                                <div key={project.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{project.name}</h4>
                                                        <span className="text-sm text-muted-foreground">
                                                            {utilization.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    {/* <Progress value={utilization} className="mb-2" /> */}
                                                    <div className="flex justify-between text-sm">
                                                        <span>Spent: ₹{(project.totalSpend / 1000000).toFixed(2)}M</span>
                                                        <span>Budget: ₹{(project.budget / 1000000).toFixed(2)}M</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Financial Summary</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Budget</p>
                                                <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + p.budget, 0) / 10000000).toFixed(2)}Cr</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                                <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + p.totalSpend, 0) / 10000000).toFixed(2)}Cr</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Remaining</p>
                                                <p className="text-2xl font-bold">₹{((projects.reduce((sum, p) => sum + p.budget, 0) - projects.reduce((sum, p) => sum + p.totalSpend, 0)) / 10000000).toFixed(2)}Cr</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                                                <p className="text-2xl font-bold">{((projects.reduce((sum, p) => sum + p.totalSpend, 0) / projects.reduce((sum, p) => sum + p.budget, 0)) * 100).toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Alerts Subview */}
                    {subview === 'alerts' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Project Alerts</CardTitle>
                                        <CardDescription>Issues and attention-required items</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projects.filter(p => p.status === "On Hold").map((project) => (
                                        <div key={project.id} className="p-4 border rounded-lg border-red-200 bg-red-50">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-red-800">{project.name}</h3>
                                                    <p className="text-sm text-red-600">{typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}</p>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Project is on hold. Progress: {project.progress}%
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-red-600" />
                                                            <span className="text-sm text-red-700">{project.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-red-600" />
                                                            <span className="text-sm text-red-700">{typeof project.manager === 'object' ? project.manager?.name : project.manager || 'Not assigned'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="destructive">On Hold</Badge>
                                                    <p className="text-sm text-red-600 mt-1">
                                                        Budget: ₹{(project.budget / 1000000).toFixed(1)}M
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {projects.filter(p => p.status === "On Hold").length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                            <p>No active alerts. All projects are running smoothly!</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Resource Allocation Subview */}
                    {subview === 'resourceAllocation' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Resource Allocation Overview</CardTitle>
                                        <CardDescription>Project square footage and space utilization</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{project.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{typeof project.client === 'object' ? project.client?.name || 'Unknown Client' : project.client}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <LandPlot className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{project.squareFootage?.toLocaleString() || 0} sq ft</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{project.contractType || 'Standard'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={project.squareFootage && project.squareFootage > 10000 ? "default" : "secondary"}>
                                                        {project.squareFootage && project.squareFootage > 10000 ? "Large Scale" : "Standard"}
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Duration: {project.estimatedDuration || 'TBD'} days
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Material Status Subview */}
                    {subview === 'materialStatus' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Material Status & Duration Tracking</CardTitle>
                                        <CardDescription>Project timelines and estimated durations</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Project Durations</h3>
                                        {projects.map((project) => {
                                            const progressDays = Math.round((project.estimatedDuration || 0) * (project.progress || 0) / 100);
                                            const remainingDays = (project.estimatedDuration || 0) - progressDays;
                                            return (
                                                <div key={project.id} className="p-4 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-medium">{project.name}</h4>
                                                        <span className="text-sm text-muted-foreground">
                                                            {project.estimatedDuration || 0} days total
                                                        </span>
                                                    </div>
                                                    {/* <Progress value={project.progress || 0} className="mb-2" />
                                            <div className="flex justify-between text-sm">
                                                <span>Completed: {progressDays} days</span>
                                                <span>Remaining: {remainingDays} days</span>
                                            </div> */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Contract Types</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {['FIXED_PRICE', 'COST_PLUS', 'TIME_AND_MATERIALS', 'UNIT_PRICE'].map((type) => {
                                                const count = projects.filter(p => p.contractType === type).length;
                                                const totalValue = projects.filter(p => p.contractType === type).reduce((sum, p) => sum + (p.budget || 0), 0);
                                                return (
                                                    <div key={type} className="p-4 border rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium">{type.replace('_', ' ')}</p>
                                                                <p className="text-sm text-muted-foreground">{count} projects</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold">₹{(totalValue / 1000000).toFixed(1)}M</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Projects Overview Subview */}
                    {subview === 'projectsOverview' && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Projects Overview</CardTitle>
                                        <CardDescription>Detailed view of all projects and their status</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSubview('main')}>
                                        Back to Projects
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Summary Statistics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 border rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Projects</p>
                                            <p className="text-2xl font-bold">{projects.length}</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Budget</p>
                                            <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 10000000).toFixed(2)}Cr</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Spent</p>
                                            <p className="text-2xl font-bold">₹{(projects.reduce((sum, p) => sum + (p.totalSpend || 0), 0) / 10000000).toFixed(2)}Cr</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <p className="text-sm text-muted-foreground">Avg Budget</p>
                                            <p className="text-2xl font-bold">₹{(projects.length > 0 ? projects.reduce((sum, p) => sum + (p.budget || 0), 0) / projects.length / 1000000 : 0).toFixed(1)}M</p>
                                        </div>
                                    </div>

                                    {/* Projects List */}
                                    <div className="space-y-3">
                                        <h3 className="font-medium">All Projects</h3>
                                        <div className="space-y-2">
                                            {projects.map((project) => {
                                                const budgetUtilization = project.budget > 0 ? ((project.totalSpend || 0) / project.budget) * 100 : 0;
                                                const isOverBudget = budgetUtilization > 100;
                                                return (
                                                    <div key={project.id} className={`p-4 border rounded-lg ${isOverBudget ? 'border-red-200 bg-red-50' : ''}`}>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h4 className="font-medium">{project.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{project.location}</p>
                                                            </div>
                                                            <Badge variant={isOverBudget ? 'destructive' : budgetUtilization > 80 ? 'secondary' : 'default'}>
                                                                {budgetUtilization.toFixed(0)}% Utilized
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">Budget:</span>
                                                                <p className="font-medium">₹{((project.budget || 0) / 1000000).toFixed(1)}M</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Spent:</span>
                                                                <p className="font-medium">₹{((project.totalSpend || 0) / 1000000).toFixed(1)}M</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Remaining:</span>
                                                                <p className="font-medium">₹{(Math.max(0, (project.budget || 0) - (project.totalSpend || 0)) / 1000000).toFixed(1)}M</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {projects.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>No projects available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Progress Report Modal */}
                    <Dialog open={showProgressReportModal} onOpenChange={setShowProgressReportModal}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Generate Progress Report
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Select Project</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a project</option>
                                        {filteredProjects.map((project: any) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name} ({project.location})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Report Period</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>Last 7 days</option>
                                            <option>Last 30 days</option>
                                            <option>Project-to-date</option>
                                            <option>Custom range</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Detail Level</Label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>Summary</option>
                                            <option>Detailed</option>
                                            <option>Technical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <div className="flex gap-2 w-full">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowProgressReportModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 gap-2"
                                        onClick={() => {
                                            const selectElement = document.querySelector('select') as HTMLSelectElement;
                                            const selectedProjectId = parseInt(selectElement.value);
                                            const selectedProject = filteredProjects.find(
                                                (p: any) => p.id === selectedProjectId
                                            );

                                            if (selectedProject) {
                                                const reportText = generateTextReport(selectedProject);
                                                downloadTextFile(reportText, `${selectedProject.name}-report.txt`);
                                                setShowProgressReportModal(false);
                                            }
                                        }}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Download Report
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Site Photos Modal */}
                    <Dialog open={showSitePhotosModal} onOpenChange={setShowSitePhotosModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Site Photos</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <input type="file" accept="image/*" multiple />
                                {/* Add photo upload form here */}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setShowSitePhotosModal(false)}>
                                    Upload Photos
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Resource Assignment Modal */}
                    <Dialog open={showResourceAssignmentModal} onOpenChange={setShowResourceAssignmentModal}>
                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Assign Resources to Project
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                {/* Project Selection */}
                                <div className="space-y-2">
                                    <Label>Select Project</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={selectedProjectForResources || ""}
                                        onChange={(e) => setSelectedProjectForResources(e.target.value)}
                                    >
                                        <option value="" disabled>Select a project</option>
                                        {filteredProjects.map((project) => (
                                            <option key={project.id} value={project.id}>
                                                {project.name} ({project.location})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Resource Selection */}
                                <div className="space-y-2">
                                    <Label>Available Resources</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                                        {availableResources.map((resource) => (
                                            <div
                                                key={resource.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedResources.some(r => r.id === resource.id)
                                                    ? "bg-blue-50 border-blue-200"
                                                    : "hover:bg-gray-50"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedResources(prev =>
                                                        prev.some(r => r.id === resource.id)
                                                            ? prev.filter(r => r.id !== resource.id)
                                                            : [...prev, resource]
                                                    );
                                                }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{resource.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            resource.availability === "High" ? "default" :
                                                                resource.availability === "Medium" ? "secondary" : "destructive"
                                                        }
                                                    >
                                                        {resource.availability} Availability
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {resource.nextAvailable}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {resource.dailyRate ? `₹${resource.dailyRate}/day` : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Resources Summary */}
                                {selectedResources.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Selected Resources ({selectedResources.length})</Label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                                            {selectedResources.map((resource) => (
                                                <div key={resource.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                                    <div>
                                                        <p className="font-medium">{resource.name}</p>
                                                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => {
                                                            setSelectedResources(prev =>
                                                                prev.filter(r => r.id !== resource.id)
                                                            );
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Assignment Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={resourceAssignmentStartDate}
                                            onChange={(e) => setResourceAssignmentStartDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (days)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={resourceAssignmentDuration}
                                            onChange={(e) => setResourceAssignmentDuration(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {/* Assignment Notes */}
                                <div className="space-y-2">
                                    <Label>Assignment Notes</Label>
                                    <Textarea
                                        placeholder="Add special instructions or requirements..."
                                        value={resourceAssignmentNotes}
                                        onChange={(e) => setResourceAssignmentNotes(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedResources([]);
                                        setSelectedProjectForResources("");
                                        setResourceAssignmentStartDate("");
                                        setResourceAssignmentDuration(1);
                                        setResourceAssignmentNotes("");
                                        setShowResourceAssignmentModal(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (!selectedProjectForResources || selectedResources.length === 0) {
                                            toast({
                                                title: "Missing Information",
                                                description: "Please select a project and at least one resource",
                                                variant: "destructive",
                                            });
                                            return;
                                        }

                                        // Create the assignment
                                        const assignment = {
                                            projectId: selectedProjectForResources,
                                            resources: selectedResources,
                                            startDate: resourceAssignmentStartDate,
                                            duration: resourceAssignmentDuration,
                                            notes: resourceAssignmentNotes,
                                            status: "Pending",
                                            assignedAt: new Date().toISOString(),
                                        };

                                        // In a real app, you would send this to your API
                                        console.log("Creating assignment:", assignment);

                                        // Show success message
                                        toast({
                                            title: "Resources Assigned",
                                            description: `${selectedResources.length} resources have been assigned to the project`,
                                        });

                                        // Reset form
                                        setSelectedResources([]);
                                        setSelectedProjectForResources("");
                                        setResourceAssignmentStartDate("");
                                        setResourceAssignmentDuration(1);
                                        setResourceAssignmentNotes("");
                                        setShowResourceAssignmentModal(false);
                                    }}
                                    disabled={isAssigningResources}
                                >
                                    {isAssigningResources ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        "Confirm Assignment"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Safety Alert Modal */}
                    <Dialog open={showSafetyAlertModal} onOpenChange={setShowSafetyAlertModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Safety Alert</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Textarea placeholder="Describe the safety concern..." />
                                {/* Add safety alert form here */}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setShowSafetyAlertModal(false)}>
                                    Submit Alert
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </TabsContent>

                <TabsContent value="list" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project List</CardTitle>
                            <CardDescription>Detailed list view of all projects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Project list view coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="milestone" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Milestones</CardTitle>
                            <CardDescription>Track and manage project milestones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Milestone tracking view coming soon...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* DPR Modal */}
            {showDPRModal && (
                <DPRModal onClose={() => setShowDPRModal(false)} projects={projects} />
            )}
        </div>
    );
};

const Projects = () => {
    return (
        <PageUserFilterProvider allowedRoles={['project']}>
            <ProjectsContent />
        </PageUserFilterProvider>
    );
};

export default Projects;
