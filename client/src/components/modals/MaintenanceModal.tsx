import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface MaintenanceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  maintenance?: any; // For editing existing maintenance
  mode: 'create' | 'edit';
  vehicleId?: string;
}

const vehicleStatusOptions = ['ACTIVE', 'IDLE', 'MAINTENANCE'];

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ 
  onClose, 
  onSuccess, 
  maintenance,
  mode,
  vehicleId 
}) => {
  const [lastServiced, setLastServiced] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || '');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (maintenance && mode === 'edit') {
      setLastServiced(new Date(maintenance.lastServiced).toISOString().split('T')[0]);
      setNextDue(new Date(maintenance.nextDue).toISOString().split('T')[0]);
      setStatus(maintenance.status);
      setSelectedVehicleId(maintenance.vehicleId || '');
    }
    
    // Fetch vehicles for selection when creating new maintenance
    if (mode === 'create' && !vehicleId) {
      fetchVehicles();
    }
  }, [maintenance, mode, vehicleId]);

  const fetchVehicles = async () => {
    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/vehicles`, { headers });
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  async function handleSubmit() {
    if (!lastServiced || !nextDue || !status || (mode === 'create' && !selectedVehicleId)) {
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
      
      const maintenanceData = {
        lastServiced: new Date(lastServiced).toISOString(),
        nextDue: new Date(nextDue).toISOString(),
        status,
        ...(mode === 'create' && { vehicleId: selectedVehicleId })
      };

      if (mode === 'create') {
        await axios.post(`${API_URL}/vehicles/maintenance`, maintenanceData, { headers });
        toast({
          title: "Success",
          description: "Maintenance record created successfully",
        });
      } else {
        await axios.put(`${API_URL}/vehicles/maintenance/${maintenance.id}`, maintenanceData, { headers });
        toast({
          title: "Success",
          description: "Maintenance record updated successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving maintenance:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save maintenance record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Maintenance Record' : 'Edit Maintenance Record'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {mode === 'create' && !vehicleId && (
            <div className="space-y-2">
              <Label htmlFor="vehicleSelect">Select Vehicle*</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicleSelect">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleName} - {vehicle.registrationNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
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
          
          <div className="space-y-2">
            <Label htmlFor="status">Status*</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {vehicleStatusOptions.map(statusOption => (
                  <SelectItem key={statusOption} value={statusOption}>{statusOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              disabled={!lastServiced || !nextDue || !status || (mode === 'create' && !selectedVehicleId) || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Saving..." : mode === 'create' ? "Add Record" : "Update Record"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModal;
