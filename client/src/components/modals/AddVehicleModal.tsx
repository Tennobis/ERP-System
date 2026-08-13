import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

// Utility function to generate a UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface AddVehicleModalProps {
  onClose: () => void;
  onAdd?: (vehicle: any) => void;
  onSuccess?: () => void;
}

const vehicleStatusOptions = ['ACTIVE', 'IDLE', 'MAINTENANCE'];

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onAdd, onSuccess }) => {
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [assignedSite, setAssignedSite] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleStatus, setVehicleStatus] = useState('ACTIVE');
  const [lastServiced, setLastServiced] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  async function handleAdd() {
    if (!vehicleName || !vehicleType || !registrationNumber || !licensePlate || !assignedSite || !driverName || !vehicleStatus || !lastServiced || !nextDue || !length || !width || !height || !weight) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Get current user ID from token or generate a new UUID
      let currentUserId = generateUUID(); // Generate a new UUID as fallback
      
      try {
        if (token) {
          // Decode JWT token to get user ID
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          if (tokenPayload.id || tokenPayload.userId || tokenPayload.sub) {
            currentUserId = tokenPayload.id || tokenPayload.userId || tokenPayload.sub;
          }
        }
      } catch (error) {
        console.warn('Could not decode JWT token, using generated UUID');
      }
      
      const vehicleData = {
        vehicleName,
        vehicleType,
        registrationNumber,
        assignedSite,
        licensePlate,
        driverName,
        createdById: currentUserId,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
      };

      const maintenanceData = {
        lastServiced: new Date(lastServiced).toISOString(),
        nextDue: new Date(nextDue).toISOString(),
        status: vehicleStatus,
      };

      // Create vehicle first
      const vehicleResponse = await axios.post(`${API_URL}/vehicles`, vehicleData, { headers });
      
      // Create maintenance record for the vehicle
      const maintenancePayload = {
        ...maintenanceData,
        vehicleId: vehicleResponse.data.vehicle.id,
      };
      
      await axios.post(`${API_URL}/vehicles/maintenance`, maintenancePayload, { headers });
      
      toast({
        title: "Success",
        description: "Vehicle created successfully",
      });
      
      if (onAdd) {
        onAdd(vehicleResponse.data.vehicle);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="vehicleName">Vehicle Name*</Label>
            <Input 
              id="vehicleName" 
              value={vehicleName} 
              onChange={e => setVehicleName(e.target.value)} 
              placeholder="e.g. Truck 1" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type*</Label>
            <Input 
              id="vehicleType" 
              value={vehicleType} 
              onChange={e => setVehicleType(e.target.value)} 
              placeholder="e.g. Truck, Excavator, Crane" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number*</Label>
            <Input 
              id="registrationNumber" 
              value={registrationNumber} 
              onChange={e => setRegistrationNumber(e.target.value)} 
              placeholder="e.g. MH12AB1234" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate*</Label>
            <Input 
              id="licensePlate" 
              value={licensePlate} 
              onChange={e => setLicensePlate(e.target.value)} 
              placeholder="e.g. MH-12-AB-1234" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedSite">Assigned Site*</Label>
            <Input 
              id="assignedSite" 
              value={assignedSite} 
              onChange={e => setAssignedSite(e.target.value)} 
              placeholder="e.g. Site A, Warehouse, Depot" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driverName">Driver Name*</Label>
            <Input 
              id="driverName" 
              value={driverName} 
              onChange={e => setDriverName(e.target.value)} 
              placeholder="e.g. John Doe" 
            />
          </div>
          
          {/* New dimensions fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (m)</Label>
              <Input 
                id="length" 
                type="number"
                step="0.01"
                min="0"
                value={length} 
                onChange={e => setLength(e.target.value)} 
                placeholder="e.g. 5.2" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (m)</Label>
              <Input 
                id="width" 
                type="number"
                step="0.01"
                min="0"
                value={width} 
                onChange={e => setWidth(e.target.value)} 
                placeholder="e.g. 2.1" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (m)</Label>
              <Input 
                id="height" 
                type="number"
                step="0.01"
                min="0"
                value={height} 
                onChange={e => setHeight(e.target.value)} 
                placeholder="e.g. 2.5" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Weight (kg)</Label>
              <Input 
                id="weight" 
                type="number"
                step="1"
                min="0"
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                placeholder="e.g. 2500" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleStatus">Vehicle Status*</Label>
            <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
              <SelectTrigger id="vehicleStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {vehicleStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Maintenance Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="lastServiced">Last Serviced*</Label>
              <Input 
                id="lastServiced" 
                type="date"
                value={lastServiced} 
                onChange={e => setLastServiced(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nextDue">Next Due*</Label>
              <Input 
                id="nextDue" 
                type="date"
                value={nextDue} 
                onChange={e => setNextDue(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              disabled={!vehicleName || !vehicleType || !registrationNumber || !licensePlate || !assignedSite || !driverName || !vehicleStatus || !lastServiced || !nextDue || isLoading}
              onClick={handleAdd}
            >
              {isLoading ? "Adding..." : "Add Vehicle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleModal;