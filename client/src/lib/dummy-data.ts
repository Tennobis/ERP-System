import type { Project, Client, Design, Invoice, InventoryItem, Employee, Task, Issue } from '../types/dummy-data-types';

export const projectsData: Project[] = [
  { id: "P001", name: "Luxury Villa Complex", client: "ABC Developers", status: "In Progress", progress: 75, budget: 5000000, spent: 3750000 },
  { id: "P002", name: "Commercial Tower", client: "XYZ Corp", status: "Planning", progress: 25, budget: 12000000, spent: 2400000 },
  { id: "P003", name: "Residential Apartments", client: "Home Builders", status: "Completed", progress: 100, budget: 8000000, spent: 7800000 },
  { id: "P004", name: "Shopping Mall", client: "Retail Group", status: "On Hold", progress: 45, budget: 15000000, spent: 6750000 },
]

export const clientsData: Client[] = [
  { id: "C001", name: "ABC Developers", totalProjects: 3, activeProjects: 2, totalValue: 25000000, lastContact: "2024-01-15" },
  { id: "C002", name: "XYZ Corp", totalProjects: 1, activeProjects: 1, totalValue: 12000000, lastContact: "2024-01-20" },
  { id: "C003", name: "Home Builders", totalProjects: 2, activeProjects: 0, totalValue: 15000000, lastContact: "2024-01-10" },
]

export const designsData: Design[] = [
  { id: "D001", name: "Villa Layout Plan", client: "ABC Developers", designer: "John Doe", status: "Approved", revisions: 2, uploadDate: "2024-01-10" },
  { id: "D002", name: "Tower Elevation", client: "XYZ Corp", designer: "Jane Smith", status: "Under Review", revisions: 1, uploadDate: "2024-01-18" },
  { id: "D003", name: "Apartment Floor Plan", client: "Home Builders", designer: "Mike Johnson", status: "Rejected", revisions: 4, uploadDate: "2024-01-05" },
]

export const invoicesData: Invoice[] = [
  { id: "INV001", clientName: "ABC Developers", amount: 500000, dueDate: "2024-02-15", status: "Paid" },
  { id: "INV002", clientName: "XYZ Corp", amount: 750000, dueDate: "2024-02-20", status: "Pending" },
  { id: "INV003", clientName: "Home Builders", amount: 300000, dueDate: "2024-01-30", status: "Overdue" },
]

export const inventoryData: InventoryItem[] = [
  { id: "ITM001", name: "Steel Rods", category: "Raw Material", quantity: 1500, unit: "kg", location: "Warehouse A", lastUpdated: "2024-01-20" },
  { id: "ITM002", name: "Cement Bags", category: "Raw Material", quantity: 200, unit: "bags", location: "Site 1", lastUpdated: "2024-01-19" },
  { id: "ITM003", name: "Paint Buckets", category: "Finishing", quantity: 50, unit: "buckets", location: "Warehouse B", lastUpdated: "2024-01-18" },
]

export const employeesData: Employee[] = [
  { id: "EMP001", name: "John Doe", role: "Site Engineer", department: "Construction", salary: 75000, status: "Active" },
  { id: "EMP002", name: "Jane Smith", role: "Designer", department: "Design", salary: 65000, status: "Active" },
  { id: "EMP003", name: "Mike Johnson", role: "Project Manager", department: "Management", salary: 95000, status: "Active" },
]

export const tasksData: Task[] = [
  { id: "T001", name: "Foundation Work", project: "Luxury Villa Complex", assignedTo: "Site Team A", dueDate: "2024-02-10", status: "In Progress", progress: 80 },
  { id: "T002", name: "Steel Framework", project: "Commercial Tower", assignedTo: "Site Team B", dueDate: "2024-02-25", status: "Not Started", progress: 0 },
  { id: "T003", name: "Interior Design", project: "Residential Apartments", assignedTo: "Design Team", dueDate: "2024-02-05", status: "Completed", progress: 100 },
]

export const issuesData: Issue[] = [
  { id: "ISS001", type: "Safety", description: "Missing safety equipment on site", reportedBy: "Site Supervisor", severity: "High", status: "Open", dateLogged: "2024-01-20" },
  { id: "ISS002", type: "Quality", description: "Concrete mix not meeting specifications", reportedBy: "Quality Inspector", severity: "Medium", status: "Resolved", dateLogged: "2024-01-18" },
  { id: "ISS003", type: "Delay", description: "Material delivery delayed by 3 days", reportedBy: "Site Manager", severity: "Low", status: "In Progress", dateLogged: "2024-01-19" },
]
