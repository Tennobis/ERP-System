import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";

interface AddVendorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VendorData {
  gstin: string;
  name: string;
  vendorType: string;
  gstCategory: string;
  email: string;
  mobile: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
}

// API configuration
const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

export const AddVendorModal = ({ open, onOpenChange }: AddVendorModalProps) => {
  const { user } = useUser();
  const [vendorData, setVendorData] = useState<VendorData>({
    gstin: "",
    name: "",
    vendorType: "COMPANY",
    gstCategory: "UNREGISTERED",
    email: "",
    mobile: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!vendorData.name || !vendorData.vendorType || !vendorData.gstCategory) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      if (!token) {
        throw new Error("Authentication required");
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Prepare vendor data according to schema
      const vendorPayload = {
        gstin: vendorData.gstin || null,
        name: vendorData.name,
        vendorType: vendorData.vendorType,
        gstCategory: vendorData.gstCategory,
        email: vendorData.email || null,
        mobile: vendorData.mobile || null,
        postalCode: vendorData.postalCode || null,
        addressLine1: vendorData.addressLine1 || null,
        addressLine2: vendorData.addressLine2 || null,
        city: vendorData.city || null,
        state: vendorData.state || null,
        country: vendorData.country || "India",
        createdBy: user.id,
      };

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(`${API_URL}/vendors`, vendorPayload, {
        headers,
      });

      toast({
        title: "Vendor added successfully",
        description: `${vendorData.name} has been registered in the system`,
      });

      // Reset form
      setVendorData({
        gstin: "",
        name: "",
        vendorType: "COMPANY",
        gstCategory: "UNREGISTERED",
        email: "",
        mobile: "",
        postalCode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating vendor:", error);
      toast({
        title: "Error adding vendor",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setVendorData({
      gstin: "",
      name: "",
      vendorType: "COMPANY",
      gstCategory: "UNREGISTERED",
      email: "",
      mobile: "",
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* GSTIN / UIN Section */}
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN / UIN</Label>
            <Input
              id="gstin"
              value={vendorData.gstin}
              onChange={(e) =>
                setVendorData({ ...vendorData, gstin: e.target.value })
              }
              placeholder="Enter GSTIN / UIN"
            />
          </div>

          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendor Name">Vendor Name *</Label>
            <Input
              id="vendorName"
              value={vendorData.name}
              onChange={(e) =>
                setVendorData({ ...vendorData, name: e.target.value })
              }
              placeholder="Enter vendor name"
              required
            />
          </div>

          {/* Vendor Type */}
          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type *</Label>
            <Select
              value={vendorData.vendorType}
              onValueChange={(value) =>
                setVendorData({ ...vendorData, vendorType: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="PROPRIETORSHIP">Proprietorship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GST Category */}
          <div className="space-y-2">
            <Label htmlFor="gstCategory">GST Category *</Label>
            <Select
              value={vendorData.gstCategory}
              onValueChange={(value) =>
                setVendorData({ ...vendorData, gstCategory: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GST category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNREGISTERED">Unregistered</SelectItem>
                <SelectItem value="REGISTERED">Registered</SelectItem>
                {/* <SelectItem value="COMPOSITION">Composition</SelectItem>
                <SelectItem value="SEZ">SEZ</SelectItem>
                <SelectItem value="DEEMED_EXPORT">Deemed Export</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Contact Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Primary Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={vendorData.email}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={vendorData.mobile}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, mobile: e.target.value })
                  }
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          {/* Primary Address Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Primary Address Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={vendorData.postalCode}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, postalCode: e.target.value })
                  }
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City/Town</Label>
                <Input
                  id="city"
                  value={vendorData.city}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, city: e.target.value })
                  }
                  placeholder="Enter city/town"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Street Address</Label>
              <Input
                id="addressLine1"
                value={vendorData.addressLine1}
                onChange={(e) =>
                  setVendorData({ ...vendorData, addressLine1: e.target.value })
                }
                placeholder="Enter address line 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={vendorData.state}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, state: e.target.value })
                  }
                  placeholder="Enter state/province"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={vendorData.country}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, country: e.target.value })
                  }
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {/* <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Edit Full Form
          </Button> */}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
