import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AddVehicleMovementModal from './modals/AddVehicleMovementModal';
import EditVehicleMovementModal from './modals/EditVehicleMovementModal';
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

interface VehicleMovementLogsTableProps {
  vehicleMovementLogs: VehicleMovement[];
  onRefresh: () => void;
  userID?: string;
}

const VehicleMovementLogsTable: React.FC<VehicleMovementLogsTableProps> = ({ 
  vehicleMovementLogs, 
  onRefresh ,
  userID
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<VehicleMovement | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleEdit = (movement: VehicleMovement) => {
    setSelectedMovement(movement);
    setShowEditModal(true);
  };

  const handleDelete = async (movementId: string) => {
    if (!confirm('Are you sure you want to delete this movement record?')) {
      return;
    }

    setIsDeleting(movementId);

    try {
      const token = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_URL}/vehicles/movements/${movementId}`, { headers });

      toast({
        title: "Success",
        description: "Vehicle movement deleted successfully",
        variant: "default",
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error deleting vehicle movement:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete vehicle movement",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddSuccess = () => {
    onRefresh();
    setShowAddModal(false);
  };

  const handleEditSuccess = () => {
    onRefresh();
    setShowEditModal(false);
    setSelectedMovement(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vehicle Movement Logs</CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Movement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">Vehicle</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">From → To</th>
                  <th className="p-2 text-left">Driver</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicleMovementLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.Vehicle?.vehicleName || 'N/A'}</span>
                        <span className="text-xs text-gray-500">
                          {log.Vehicle?.registrationNumber || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {new Date(log.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.from}
                        </Badge>
                        <span>→</span>
                        <Badge variant="outline" className="text-xs">
                          {log.to}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">{log.Vehicle?.driverName || 'N/A'}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(log)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(log.id)}
                          disabled={isDeleting === log.id}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          {isDeleting === log.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicleMovementLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg">No movement logs found</div>
                        <Button onClick={() => setShowAddModal(true)} variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add First Movement
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showAddModal && (
        <AddVehicleMovementModal
          userID={userID}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditModal && selectedMovement && (
        <EditVehicleMovementModal
          movement={selectedMovement}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMovement(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default VehicleMovementLogsTable;
