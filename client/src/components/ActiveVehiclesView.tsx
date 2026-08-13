import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Wrench,
  Truck,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleType: string;
  registrationNumber: string;
  assignedSite: string;
  licensePlate: string;
  driverName: string;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  createdBy: {
    name: string;
    email: string;
  };
  movement: Array<{
    id: string;
    from: string;
    to: string;
    date: string;
  }>;
  maintenanceHistory: Array<{
    id: string;
    lastServiced: string;
    nextDue: string;
    status: "ACTIVE" | "IDLE" | "MAINTENANCE";
  }>;
}

interface ActiveVehiclesViewProps {
  onBack: () => void;
  totalActiveCount: number;
  userId: string;
}

const ActiveVehiclesView: React.FC<ActiveVehiclesViewProps> = ({
  onBack,
  totalActiveCount,
  userId,
}) => {
  const [activeVehicles, setActiveVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveVehicles();
  }, []);

  const fetchActiveVehicles = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch all vehicles and filter for active ones based on maintenance status
      const response = await axios.get(`${API_URL}/vehicles?userId=${userId}`, {
        headers,
      });
      const allVehicles = response.data || [];

      // Filter vehicles that are currently active (have ACTIVE maintenance status or no maintenance record)
      const activeVehiclesList = allVehicles.filter((vehicle: Vehicle) => {
        if (
          !vehicle.maintenanceHistory ||
          vehicle.maintenanceHistory.length === 0
        ) {
          return true; // Consider vehicles without maintenance records as active
        }

        // Check the most recent maintenance record
        const latestMaintenance = vehicle.maintenanceHistory[0];
        return latestMaintenance?.status === "ACTIVE";
      });

      setActiveVehicles(activeVehiclesList);
    } catch (error) {
      console.error("Error fetching active vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load active vehicles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMaintenanceProgress = (vehicle: Vehicle) => {
    if (
      !vehicle.maintenanceHistory ||
      vehicle.maintenanceHistory.length === 0
    ) {
      return { progress: 0, daysUntilDue: null, isOverdue: false };
    }

    const latestMaintenance = vehicle.maintenanceHistory[0];
    const nextDue = new Date(latestMaintenance.nextDue);
    const lastServiced = new Date(latestMaintenance.lastServiced);
    const today = new Date();

    const totalDays = Math.ceil(
      (nextDue.getTime() - lastServiced.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (today.getTime() - lastServiced.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilDue = Math.ceil(
      (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    const isOverdue = daysUntilDue < 0;

    return { progress, daysUntilDue: Math.abs(daysUntilDue), isOverdue };
  };

  const getLastMovement = (vehicle: Vehicle) => {
    if (!vehicle.movement || vehicle.movement.length === 0) {
      return null;
    }
    return vehicle.movement[0]; // Most recent movement
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading active vehicles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">Active Vehicles</CardTitle>
            <p className="text-sm text-muted-foreground">
              {activeVehicles.length} of {totalActiveCount} vehicles currently
              operational
            </p>
          </div>
        </div>
        <Badge variant="outline" className="ml-4">
          Last updated:{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Vehicles
            </h3>
            <p className="text-gray-500">
              There are currently no vehicles marked as active.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeVehicles.map((vehicle) => {
              const maintenanceInfo = getMaintenanceProgress(vehicle);
              const lastMovement = getLastMovement(vehicle);

              return (
                <Card
                  key={vehicle.id}
                  className="border-l-4 border-l-green-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vehicle.vehicleName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.registrationNumber}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        {vehicle.vehicleType}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{vehicle.assignedSite}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{vehicle.driverName}</span>
                      </div>
                    </div>

                    {/* License Plate */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">License:</span>
                      <Badge variant="secondary">{vehicle.licensePlate}</Badge>
                    </div>

                    {/* Vehicle Dimensions */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Vehicle Dimensions
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                        {vehicle.length && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">Length:</span>
                            <span className="font-medium text-gray-900">
                              {vehicle.length} m
                            </span>
                          </div>
                        )}
                        {vehicle.width && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">Width:</span>
                            <span className="font-medium text-gray-900">
                              {vehicle.width} m
                            </span>
                          </div>
                        )}
                        {vehicle.height && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">Height:</span>
                            <span className="font-medium text-gray-900">
                              {vehicle.height} m
                            </span>
                          </div>
                        )}
                        {vehicle.weight && (
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">Weight:</span>
                            <span className="font-medium text-gray-900">
                              {vehicle.weight} kg
                            </span>
                          </div>
                        )}
                      </div>
                      {!vehicle.length &&
                        !vehicle.width &&
                        !vehicle.height &&
                        !vehicle.weight && (
                          <div className="text-xs text-gray-500 italic">
                            No dimension data available
                          </div>
                        )}
                    </div>

                    {/* Last Movement */}
                    {lastMovement && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Recent Movement
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {lastMovement.from} → {lastMovement.to}
                        </p>
                        <p className="text-xs text-blue-600">
                          {new Date(lastMovement.date).toLocaleDateString()} at{" "}
                          {new Date(lastMovement.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {/* Maintenance Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Maintenance Status
                        </span>
                      </div>

                      {vehicle.maintenanceHistory &&
                      vehicle.maintenanceHistory.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>
                              Last:{" "}
                              {new Date(
                                vehicle.maintenanceHistory[0].lastServiced
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={
                                maintenanceInfo.isOverdue
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }
                            >
                              {maintenanceInfo.isOverdue
                                ? "Overdue"
                                : `${maintenanceInfo.daysUntilDue} days left`}
                            </span>
                          </div>
                          {/* <Progress 
                            value={maintenanceInfo.progress} 
                            className={`h-2 ${maintenanceInfo.isOverdue ? 'bg-red-100' : 'bg-gray-200'}`}
                          /> */}
                          <div className="text-xs text-gray-500">
                            Next due:{" "}
                            {new Date(
                              vehicle.maintenanceHistory[0].nextDue
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          No maintenance records available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveVehiclesView;
