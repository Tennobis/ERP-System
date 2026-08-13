import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  DollarSign,
  Truck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  Package,
  Search,
  X,
  Edit,
  Trash2,
  Star,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { AddVendorModal } from "@/components/modals/AddVendorModal";
import { EditVendorModal } from "@/components/modals/EditVendorModal";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Vendor interface based on Prisma schema
interface Vendor {
  id: string;
  gstin?: string;
  name: string;
  vendorType: "COMPANY" | "INDIVIDUAL" | "PARTNERSHIP" | "PROPRIETORSHIP";
  gstCategory:
    | "UNREGISTERED"
    | "REGULAR"
    // | "COMPOSITION"
    // | "SEZ"
    // | "DEEMED_EXPORT";
  email?: string;
  mobile?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Additional legacy fields for backward compatibility
  category?: string;
  location?: string;
  contact?: string;
  address?: string;
  paymentTerms?: string;
  documents?: string;
}

export function VendorManagement({ selectedUserId }: { selectedUserId?: string }) {
  const { user } = useUser();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorType, setSelectedVendorType] = useState("all");
  const [selectedGstCategory, setSelectedGstCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const targetUserId = selectedUserId || user.id;
      
      // Use user-specific route if role is not 'accounts'
      const endpoint = user?.role !== 'accounts' && (user?.role==='admin' || user?.role==='md' ? targetUserId !== user?.id : targetUserId)
        ? `${API_URL}/vendors/user/${targetUserId}`
        : `${API_URL}/vendors`;
      
      const response = await axios.get(endpoint, { headers });
      setVendors(response.data);
      setFilteredVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [selectedUserId, user?.id, user?.role]);

  // Filter vendors based on search and filters
  useEffect(() => {
    let filtered = vendors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vendor.gstin &&
            vendor.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (vendor.email &&
            vendor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (vendor.city &&
            vendor.city.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Vendor type filter
    if (selectedVendorType !== "all") {
      filtered = filtered.filter(
        (vendor) => vendor.vendorType === selectedVendorType
      );
    }

    // GST category filter
    if (selectedGstCategory !== "all") {
      filtered = filtered.filter(
        (vendor) => vendor.gstCategory === selectedGstCategory
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, selectedVendorType, selectedGstCategory,selectedUserId]);

  const getVendorTypeLabel = (type: string) => {
    switch (type) {
      case "COMPANY":
        return "Company";
      case "INDIVIDUAL":
        return "Individual";
      case "PARTNERSHIP":
        return "Partnership";
      case "PROPRIETORSHIP":
        return "Proprietorship";
      default:
        return type;
    }
  };

  const getGstCategoryLabel = (category: string) => {
    switch (category) {
      case "UNREGISTERED":
        return "Unregistered";
      case "REGULAR":
        return "Regular";
      // case "COMPOSITION":
      //   return "Composition";
      // case "SEZ":
      //   return "SEZ";
      // case "DEEMED_EXPORT":
      //   return "Deemed Export";
      default:
        return category;
    }
  };

  const getGstCategoryColor = (category: string) => {
    switch (category) {
      case "REGISTERED":
        return "default";
      case "COMPOSITION":
        return "secondary";
      case "SEZ":
        return "outline";
      case "DEEMED_EXPORT":
        return "outline";
      default:
        return "destructive";
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/vendors/${vendorId}`, { headers });

      setVendors(vendors.filter((v) => v.id !== vendorId));
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteVendor = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteAlert(true);
  };

  const executeDeleteVendor = async () => {
    if (!vendorToDelete) return;

    await handleDeleteVendor(vendorToDelete.id);
    setShowDeleteAlert(false);
    setVendorToDelete(null);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setShowEditVendorModal(true);
  };

  const handleUpdateVendor = async (updatedVendorData: Partial<Vendor>) => {
    if (!vendorToEdit) return;

    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.put(
        `${API_URL}/vendors/${vendorToEdit.id}`,
        updatedVendorData,
        { headers }
      );

      // Update the vendor in the local state
      setVendors(vendors.map(v => v.id === vendorToEdit.id ? response.data : v));
      
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      
      setShowEditVendorModal(false);
      setVendorToEdit(null);
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Vendor Management</h3>
          <p className="text-muted-foreground">
            Manage and track vendor information and performance
          </p>
        </div>
        {(user?.role === 'project' || user?.role === 'admin' || user?.role === 'md') && (
          <Button onClick={() => setShowNewVendorModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Vendor
          </Button>
        )}
      </div>
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
          <CardDescription>
            View and manage all vendor information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search vendors by name, GSTIN, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={selectedVendorType}
              onValueChange={setSelectedVendorType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="PROPRIETORSHIP">Proprietorship</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedGstCategory}
              onValueChange={setSelectedGstCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by GST" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All GST Categories</SelectItem>
                <SelectItem value="UNREGISTERED">Unregistered</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading vendors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>GST Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {vendors.length === 0
                        ? "No vendors found"
                        : "No vendors match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          {vendor.gstin && (
                            <p className="text-sm text-muted-foreground">
                              GSTIN: {vendor.gstin}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getVendorTypeLabel(vendor.vendorType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getGstCategoryColor(vendor.gstCategory)}
                        >
                          {getGstCategoryLabel(vendor.gstCategory)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {vendor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {vendor.email}
                            </div>
                          )}
                          {vendor.mobile && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {vendor.mobile}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.city || vendor.state ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {[vendor.city, vendor.state]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowVendorDetails(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteVendor(vendor)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Modal */}
      <Dialog open={showVendorDetails} onOpenChange={setShowVendorDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVendor?.name} - Vendor Details</DialogTitle>
            <DialogDescription>
              Complete vendor information and business details
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Vendor Name</Label>
                  <p className="font-medium">{selectedVendor.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vendor Type</Label>
                  <p className="font-medium">
                    {getVendorTypeLabel(selectedVendor.vendorType)}
                  </p>
                </div>
                {selectedVendor.gstin && (
                  <div>
                    <Label className="text-muted-foreground">GSTIN/UIN</Label>
                    <p className="font-medium">{selectedVendor.gstin}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">GST Category</Label>
                  <p className="font-medium">
                    {getGstCategoryLabel(selectedVendor.gstCategory)}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-lg mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedVendor.email && (
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedVendor.email}</p>
                    </div>
                  )}
                  {selectedVendor.mobile && (
                    <div>
                      <Label className="text-muted-foreground">Mobile</Label>
                      <p className="font-medium">{selectedVendor.mobile}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="font-semibold text-lg mb-3">
                  Address Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedVendor.addressLine1 && (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">
                        Street Address
                      </Label>
                      <p className="font-medium">
                        {selectedVendor.addressLine1}
                        {selectedVendor.addressLine2 &&
                          `, ${selectedVendor.addressLine2}`}
                      </p>
                    </div>
                  )}
                  {selectedVendor.city && (
                    <div>
                      <Label className="text-muted-foreground">City</Label>
                      <p className="font-medium">{selectedVendor.city}</p>
                    </div>
                  )}
                  {selectedVendor.state && (
                    <div>
                      <Label className="text-muted-foreground">State</Label>
                      <p className="font-medium">{selectedVendor.state}</p>
                    </div>
                  )}
                  {selectedVendor.postalCode && (
                    <div>
                      <Label className="text-muted-foreground">
                        Postal Code
                      </Label>
                      <p className="font-medium">{selectedVendor.postalCode}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Country</Label>
                    <p className="font-medium">{selectedVendor.country}</p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div>
                <h4 className="font-semibold text-lg mb-3">
                  System Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Created Date
                    </Label>
                    <p className="font-medium">
                      {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="font-medium">
                      {new Date(selectedVendor.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowVendorDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={showNewVendorModal}
        onOpenChange={(open) => {
          setShowNewVendorModal(open);
          if (!open) {
            // Refresh vendors list when modal closes
            fetchVendors();
          }
        }}
      />

      {/* Edit Vendor Modal */}
      {vendorToEdit && (
        <EditVendorModal
          vendor={vendorToEdit}
          open={showEditVendorModal}
          onOpenChange={setShowEditVendorModal}
          onUpdate={handleUpdateVendor}
        />
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vendor{" "}
              <span className="font-semibold">{vendorToDelete?.name}</span> and
              remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteVendor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Vendor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
