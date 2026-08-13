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
  Clock,
  Truck,
  PauseCircle,
  AlertCircle,
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

interface IdleVehiclesViewProps {
  onBack: () => void;
  totalIdleCount: number;
  userId: string;
}

const IdleVehiclesView: React.FC<IdleVehiclesViewProps> = ({
  onBack,
  totalIdleCount,
  userId,
}) => {
  const [idleVehicles, setIdleVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIdleVehicles();
  }, []);

  const fetchIdleVehicles = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch all vehicles and filter for idle ones based on maintenance status
      const response = await axios.get(`${API_URL}/vehicles?userId=${userId}`, {
        headers,
      });
      const allVehicles = response.data || [];

      // Filter vehicles that are currently idle (have IDLE maintenance status)
      const idleVehiclesList = allVehicles.filter((vehicle: Vehicle) => {
        if (
          !vehicle.maintenanceHistory ||
          vehicle.maintenanceHistory.length === 0
        ) {
          return false; // Vehicles without maintenance records are not considered idle
        }

        // Check the most recent maintenance record
        const latestMaintenance = vehicle.maintenanceHistory[0];
        return latestMaintenance?.status === "IDLE";
      });

      setIdleVehicles(idleVehiclesList);
    } catch (error) {
      console.error("Error fetching idle vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load idle vehicles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIdleDuration = (vehicle: Vehicle) => {
    if (!vehicle.movement || vehicle.movement.length === 0) {
      return { message: "No movement history", days: null };
    }

    const lastMovement = vehicle.movement[0];
    const lastMovementDate = new Date(lastMovement.date);
    const today = new Date();
    const daysSinceLastMovement = Math.ceil(
      (today.getTime() - lastMovementDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      message: `${daysSinceLastMovement} day${
        daysSinceLastMovement !== 1 ? "s" : ""
      } since last movement`,
      days: daysSinceLastMovement,
    };
  };

  const getMaintenanceInfo = (vehicle: Vehicle) => {
    if (
      !vehicle.maintenanceHistory ||
      vehicle.maintenanceHistory.length === 0
    ) {
      return null;
    }

    const latestMaintenance = vehicle.maintenanceHistory[0];
    const nextDue = new Date(latestMaintenance.nextDue);
    const today = new Date();
    const daysUntilDue = Math.ceil(
      (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isOverdue = daysUntilDue < 0;

    return {
      lastServiced: new Date(latestMaintenance.lastServiced),
      nextDue,
      daysUntilDue: Math.abs(daysUntilDue),
      isOverdue,
    };
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
            <span className="ml-2">Loading idle vehicles...</span>
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
            <CardTitle className="text-xl">Idle Vehicles</CardTitle>
            <p className="text-sm text-muted-foreground">
              {idleVehicles.length} vehicle
              {idleVehicles.length !== 1 ? "s" : ""} currently idle
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
        {idleVehicles.length === 0 ? (
          <div className="text-center py-8">
            <PauseCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Idle Vehicles
            </h3>
            <p className="text-gray-500">
              All vehicles are currently active or under maintenance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {idleVehicles.map((vehicle) => {
              const idleDuration = getIdleDuration(vehicle);
              const maintenanceInfo = getMaintenanceInfo(vehicle);
              const lastMovement = getLastMovement(vehicle);

              return (
                <Card
                  key={vehicle.id}
                  className="border-l-4 border-l-yellow-500"
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
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className="text-yellow-600 border-yellow-600"
                        >
                          {vehicle.vehicleType}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-yellow-700 bg-yellow-100"
                        >
                          <PauseCircle className="h-3 w-3 mr-1" />
                          IDLE
                        </Badge>
                      </div>
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

                    {/* Idle Duration */}
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">
                          Idle Duration
                        </span>
                      </div>
                      <p className="text-sm text-yellow-800">
                        {idleDuration.message}
                      </p>
                      {idleDuration.days && idleDuration.days > 7 && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600">
                            Extended idle period
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Last Movement */}
                    {lastMovement && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Last Movement
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">
                          {lastMovement.from} → {lastMovement.to}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(lastMovement.date).toLocaleDateString()} at{" "}
                          {new Date(lastMovement.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {/* Maintenance Info */}
                    {maintenanceInfo && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            Next Maintenance
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            Due: {maintenanceInfo.nextDue.toLocaleDateString()}
                          </div>
                          <div
                            className={
                              maintenanceInfo.isOverdue
                                ? "text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {maintenanceInfo.isOverdue
                              ? `Overdue by ${maintenanceInfo.daysUntilDue} days`
                              : `${maintenanceInfo.daysUntilDue} days remaining`}
                          </div>
                          {maintenanceInfo.isOverdue && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">
                                Maintenance overdue
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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

export default IdleVehiclesView;
