import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Vendor {
  id: string;
  gstin?: string;
  name: string;
  vendorType: "COMPANY" | "INDIVIDUAL" | "PARTNERSHIP" | "PROPRIETORSHIP";
  gstCategory:
    | "UNREGISTERED"
    | "REGISTERED"
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
}

interface EditVendorModalProps {
  vendor: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: Partial<Vendor>) => void;
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

export const EditVendorModal = ({ vendor, open, onOpenChange, onUpdate }: EditVendorModalProps) => {
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
    country: "India"
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when vendor prop changes
  useEffect(() => {
    if (vendor) {
      setVendorData({
        gstin: vendor.gstin || "",
        name: vendor.name || "",
        vendorType: vendor.vendorType || "COMPANY",
        gstCategory: vendor.gstCategory || "UNREGISTERED",
        email: vendor.email || "",
        mobile: vendor.mobile || "",
        postalCode: vendor.postalCode || "",
        addressLine1: vendor.addressLine1 || "",
        addressLine2: vendor.addressLine2 || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "India"
      });
    }
  }, [vendor]);

  const handleSave = async () => {
    if (!vendorData.name || !vendorData.vendorType || !vendorData.gstCategory) {
      toast({
        title: "Missing required fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
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
        country: vendorData.country || "India"
      };

      await onUpdate(vendorPayload as any);
      
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error updating vendor",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (vendor) {
      setVendorData({
        gstin: vendor.gstin || "",
        name: vendor.name || "",
        vendorType: vendor.vendorType || "COMPANY",
        gstCategory: vendor.gstCategory || "UNREGISTERED",
        email: vendor.email || "",
        mobile: vendor.mobile || "",
        postalCode: vendor.postalCode || "",
        addressLine1: vendor.addressLine1 || "",
        addressLine2: vendor.addressLine2 || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "India"
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor - {vendor?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* GSTIN / UIN Section */}
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN / UIN</Label>
            <Input
              id="gstin"
              value={vendorData.gstin}
              onChange={(e) => setVendorData({...vendorData, gstin: e.target.value})}
              placeholder="Enter GSTIN / UIN"
            />
          </div>

          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name *</Label>
            <Input
              id="vendorName"
              value={vendorData.name}
              onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
              placeholder="Enter vendor name"
              required
            />
          </div>

          {/* Vendor Type */}
          <div className="space-y-2">
            <Label htmlFor="vendorType">Vendor Type *</Label>
            <Select
              value={vendorData.vendorType}
              onValueChange={(value) => setVendorData({...vendorData, vendorType: value})}
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
              onValueChange={(value) => setVendorData({...vendorData, gstCategory: value})}
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
                  onChange={(e) => setVendorData({...vendorData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={vendorData.mobile}
                  onChange={(e) => setVendorData({...vendorData, mobile: e.target.value})}
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
                  onChange={(e) => setVendorData({...vendorData, postalCode: e.target.value})}
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City/Town</Label>
                <Input
                  id="city"
                  value={vendorData.city}
                  onChange={(e) => setVendorData({...vendorData, city: e.target.value})}
                  placeholder="Enter city/town"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Street Address</Label>
              <Input
                id="addressLine1"
                value={vendorData.addressLine1}
                onChange={(e) => setVendorData({...vendorData, addressLine1: e.target.value})}
                placeholder="Enter address line 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={vendorData.addressLine2}
                onChange={(e) => setVendorData({...vendorData, addressLine2: e.target.value})}
                placeholder="Enter address line 2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={vendorData.state}
                  onChange={(e) => setVendorData({...vendorData, state: e.target.value})}
                  placeholder="Enter state/province"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={vendorData.country}
                  onChange={(e) => setVendorData({...vendorData, country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Vendor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
