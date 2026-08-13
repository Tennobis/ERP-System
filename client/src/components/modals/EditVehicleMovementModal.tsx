import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface VehicleMovement {
  id: string;
  vehicleId: string;
  from: string;
  to: string;
  date: string;
  Vehicle?: {
    vehicleName: string;
    driverName: string;
    registrationNumber: string;
  };
}

interface EditVehicleMovementModalProps {
  movement: VehicleMovement;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Vehicle {
  id: string;
  vehicleName: string;
  driverName: string;
  registrationNumber: string;
}

const EditVehicleMovementModal: React.FC<EditVehicleMovementModalProps> = ({ 
  movement, 
  onClose, 
  onSuccess 
}) => {
  const [vehicleId, setVehicleId] = useState(movement.vehicleId || '');
  const [from, setFrom] = useState(movement.from);
  const [to, setTo] = useState(movement.to);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  
  const { toast } = useToast();

  // Initialize date and time from movement data
  useEffect(() => {
    const movementDate = new Date(movement.date);
    const dateStr = movementDate.toISOString().split('T')[0];
    const timeStr = movementDate.toTimeString().slice(0, 5);
    setDate(dateStr);
    setTime(timeStr);
  }, [movement.date]);

  // Fetch vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/vehicles`, { headers });
        setVehicles(response.data || []);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error",
          description: "Failed to load vehicles",
          variant: "destructive",
        });
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleUpdate = async () => {
    if (!vehicleId || !from || !to || !date || !time) {
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

      // Combine date and time into a single DateTime string
      const datetime = new Date(`${date}T${time}`).toISOString();

      const movementData = {
        vehicleId,
        from: from.trim(),
        to: to.trim(),
        date: datetime,
      };

      await axios.put(`${API_URL}/vehicles/movements/${movement.id}`, movementData, { headers });

      toast({
        title: "Success",
        description: "Vehicle movement updated successfully",
        variant: "default",
      });

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Error updating vehicle movement:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vehicle movement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Movement</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle" className="text-right">
              Vehicle *
            </Label>
            <div className="col-span-3">
              <Select value={vehicleId} onValueChange={setVehicleId} disabled={isLoadingVehicles}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingVehicles ? "Loading vehicles..." : "Select vehicle"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleName} ({vehicle.registrationNumber}) - {vehicle.driverName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From *
            </Label>
            <Input
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="col-span-3"
              placeholder="Starting location"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="to" className="text-right">
              To *
            </Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="col-span-3"
              placeholder="Destination location"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time *
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Movement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleMovementModal;
