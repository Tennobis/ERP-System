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
  Wrench,
  AlertTriangle,
  CheckCircle,
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

interface MaintenanceVehiclesViewProps {
  onBack: () => void;
  totalMaintenanceCount: number;
  userId: string;
}

const MaintenanceVehiclesView: React.FC<MaintenanceVehiclesViewProps> = ({
  onBack,
  totalMaintenanceCount,
  userId,
}) => {
  const [maintenanceVehicles, setMaintenanceVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaintenanceVehicles();
  }, []);

  const fetchMaintenanceVehicles = async () => {
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch all vehicles and filter for maintenance ones based on maintenance status
      const response = await axios.get(`${API_URL}/vehicles?userId=${userId}`, {
        headers,
      });
      const allVehicles = response.data || [];

      // Filter vehicles that are currently under maintenance (have MAINTENANCE maintenance status)
      const maintenanceVehiclesList = allVehicles.filter((vehicle: Vehicle) => {
        if (
          !vehicle.maintenanceHistory ||
          vehicle.maintenanceHistory.length === 0
        ) {
          return false; // Vehicles without maintenance records are not under maintenance
        }

        // Check the most recent maintenance record
        const latestMaintenance = vehicle.maintenanceHistory[0];
        return latestMaintenance?.status === "MAINTENANCE";
      });

      setMaintenanceVehicles(maintenanceVehiclesList);
    } catch (error) {
      console.error("Error fetching maintenance vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load vehicles under maintenance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMaintenanceInfo = (vehicle: Vehicle) => {
    if (
      !vehicle.maintenanceHistory ||
      vehicle.maintenanceHistory.length === 0
    ) {
      return null;
    }

    const latestMaintenance = vehicle.maintenanceHistory[0];
    const lastServiced = new Date(latestMaintenance.lastServiced);
    const nextDue = new Date(latestMaintenance.nextDue);
    const today = new Date();

    const maintenanceDuration = Math.ceil(
      (today.getTime() - lastServiced.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysUntilNext = Math.ceil(
      (nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      lastServiced,
      nextDue,
      maintenanceDuration,
      daysUntilNext,
      isOverdue: daysUntilNext < 0,
    };
  };

  const getMaintenancePriority = (vehicle: Vehicle) => {
    const maintenanceInfo = getMaintenanceInfo(vehicle);
    if (!maintenanceInfo) return "low";

    if (maintenanceInfo.maintenanceDuration > 30) return "high"; // Over a month
    if (maintenanceInfo.maintenanceDuration > 14) return "medium"; // Over 2 weeks
    return "low";
  };

  const getLastMovement = (vehicle: Vehicle) => {
    if (!vehicle.movement || vehicle.movement.length === 0) {
      return null;
    }
    return vehicle.movement[0]; // Most recent movement
  };

  const getMaintenanceProgress = (maintenanceInfo: any) => {
    if (!maintenanceInfo) return 0;

    // Calculate progress based on typical maintenance duration (assume 7-14 days)
    const typicalMaintenanceDays = 14;
    const progress = Math.min(
      100,
      (maintenanceInfo.maintenanceDuration / typicalMaintenanceDays) * 100
    );
    return progress;
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading vehicles under maintenance...</span>
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
            <CardTitle className="text-xl">
              Vehicles Under Maintenance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {maintenanceVehicles.length} vehicle
              {maintenanceVehicles.length !== 1 ? "s" : ""} currently in
              workshop
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
        {maintenanceVehicles.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Vehicles Under Maintenance
            </h3>
            <p className="text-gray-500">
              All vehicles are currently operational or idle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceVehicles.map((vehicle) => {
              const maintenanceInfo = getMaintenanceInfo(vehicle);
              const priority = getMaintenancePriority(vehicle);
              const lastMovement = getLastMovement(vehicle);
              const progress = getMaintenanceProgress(maintenanceInfo);

              const priorityColors = {
                high: {
                  border: "border-l-red-500",
                  bg: "bg-red-50",
                  text: "text-red-700",
                  badge: "bg-red-100 text-red-800",
                },
                medium: {
                  border: "border-l-orange-500",
                  bg: "bg-orange-50",
                  text: "text-orange-700",
                  badge: "bg-orange-100 text-orange-800",
                },
                low: {
                  border: "border-l-blue-500",
                  bg: "bg-blue-50",
                  text: "text-blue-700",
                  badge: "bg-blue-100 text-blue-800",
                },
              };

              const colors = priorityColors[priority];

              return (
                <Card
                  key={vehicle.id}
                  className={`border-l-4 ${colors.border}`}
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
                          className="text-red-600 border-red-600"
                        >
                          {vehicle.vehicleType}
                        </Badge>
                        <Badge className={`${colors.badge}`}>
                          <Wrench className="h-3 w-3 mr-1" />
                          MAINTENANCE
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

                    {/* Maintenance Duration */}
                    {maintenanceInfo && (
                      <div className={`${colors.bg} p-3 rounded-lg`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className={`h-4 w-4 ${colors.text}`} />
                          <span
                            className={`text-sm font-medium ${colors.text}`}
                          >
                            Maintenance Duration
                          </span>
                          <Badge
                            variant="outline"
                            className={`ml-auto text-xs ${colors.badge}`}
                          >
                            {priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <p className={`text-sm ${colors.text} mb-2`}>
                          In maintenance for{" "}
                          {maintenanceInfo.maintenanceDuration} day
                          {maintenanceInfo.maintenanceDuration !== 1 ? "s" : ""}
                        </p>
                        <Progress value={progress} className="h-2 mb-2" />
                        <div className="text-xs text-gray-600 flex justify-between">
                          <span>
                            Started:{" "}
                            {maintenanceInfo.lastServiced.toLocaleDateString()}
                          </span>
                          <span>
                            Expected completion:{" "}
                            {maintenanceInfo.nextDue.toLocaleDateString()}
                          </span>
                        </div>
                        {maintenanceInfo.maintenanceDuration > 21 && (
                          <div className="flex items-center gap-1 mt-2">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600">
                              Extended maintenance period
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Last Movement Before Maintenance */}
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

                    {/* Next Service Schedule */}
                    {maintenanceInfo && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            Expected Completion
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            Target:{" "}
                            {maintenanceInfo.nextDue.toLocaleDateString()}
                          </div>
                          <div
                            className={
                              maintenanceInfo.isOverdue
                                ? "text-red-600"
                                : "text-gray-600"
                            }
                          >
                            {maintenanceInfo.isOverdue
                              ? `Overdue by ${Math.abs(
                                  maintenanceInfo.daysUntilNext
                                )} days`
                              : `${maintenanceInfo.daysUntilNext} days remaining`}
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

export default MaintenanceVehiclesView;
