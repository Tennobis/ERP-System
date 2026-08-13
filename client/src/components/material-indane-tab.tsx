import React, { useState, useEffect } from "react";
import {
    CheckCircle,
    XCircle,
    RotateCcw,
    Loader2,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const API_URL =
    import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface MaterialIndaneItem {
    id: string;
    slNo: number;
    materialDescription: string;
    unit: string;
    requiredQty: number;
    receivedQty: number;
    balance: number;
}

interface MaterialIndane {
    id: string;
    orderSlipNo: string;
    site: string;
    date: string;
    storeKeeperName: string;
    projectManagerName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    items: MaterialIndaneItem[];
}

const MaterialIndaneTab = () => {
    const [approvedIndanes, setApprovedIndanes] = useState<MaterialIndane[]>([]);
    const [rejectedIndanes, setRejectedIndanes] = useState<MaterialIndane[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
    const [selectedIndane, setSelectedIndane] = useState<MaterialIndane | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchMaterialIndanes();
    }, []);

    const fetchMaterialIndanes = async () => {
        setLoading(true);
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Fetch approved
            const approvedRes = await axios.get(
                `${API_URL}/material-indane/status/APPROVED?global=true`,
                { headers }
            );

            // Fetch rejected
            const rejectedRes = await axios.get(
                `${API_URL}/material-indane/status/REJECTED?global=true`,
                { headers }
            );

            setApprovedIndanes(Array.isArray(approvedRes.data) ? approvedRes.data : []);
            setRejectedIndanes(Array.isArray(rejectedRes.data) ? rejectedRes.data : []);
        } catch (error) {
            console.error("Error fetching material indanes:", error);
            toast({
                title: "Error",
                description: "Failed to fetch material indanes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveIndane = async (indaneId: string) => {
        setActionLoading((prev) => ({ ...prev, [indaneId]: true }));
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/material-indane/indanes/${indaneId}/approve`,
                {},
                { headers }
            );

            toast({
                title: "Approved",
                description: "Material indane approved successfully",
                variant: "default",
            });

            fetchMaterialIndanes();
        } catch (error) {
            console.error("Error approving material indane:", error);
            toast({
                title: "Error",
                description: "Failed to approve material indane",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, [indaneId]: false }));
        }
    };

    const handleRejectIndane = async (indaneId: string) => {
        setActionLoading((prev) => ({ ...prev, [indaneId]: true }));
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/material-indane/indanes/${indaneId}/reject`,
                {},
                { headers }
            );

            toast({
                title: "Rejected",
                description: "Material indane rejected successfully",
                variant: "default",
            });

            fetchMaterialIndanes();
        } catch (error) {
            console.error("Error rejecting material indane:", error);
            toast({
                title: "Error",
                description: "Failed to reject material indane",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, [indaneId]: false }));
        }
    };

    const handleUndoIndane = async (indaneId: string) => {
        setActionLoading((prev) => ({ ...prev, [indaneId]: true }));
        try {
            const token =
                sessionStorage.getItem("jwt_token") ||
                localStorage.getItem("jwt_token_backup");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.patch(
                `${API_URL}/material-indane/indanes/${indaneId}/undo`,
                {},
                { headers }
            );

            toast({
                title: "Undone",
                description: "Material indane status changed to pending",
                variant: "default",
            });

            fetchMaterialIndanes();
        } catch (error) {
            console.error("Error undoing material indane:", error);
            toast({
                title: "Error",
                description: "Failed to undo material indane status",
                variant: "destructive",
            });
        } finally {
            setActionLoading((prev) => ({ ...prev, [indaneId]: false }));
        }
    };

    const IndaneListItem = ({
        indane,
        status,
    }: {
        indane: MaterialIndane;
        status: "APPROVED" | "REJECTED";
    }) => (
        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-base">
                        {indane.orderSlipNo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Site: {indane.site}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Date: {new Date(indane.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Created by: {indane.createdBy.name}
                    </p>
                    <div className="pt-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            Items ({indane.items.length})
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs line-clamp-2">
                            {indane.items.map(item => item.materialDescription).join(", ")}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setSelectedIndane(indane);
                            setShowDetails(true);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    <div className="flex gap-2">
                        {status === "APPROVED" ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-24"
                                    onClick={() => handleUndoIndane(indane.id)}
                                    disabled={actionLoading[indane.id]}
                                >
                                    {actionLoading[indane.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Undo
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="w-24"
                                    onClick={() => handleRejectIndane(indane.id)}
                                    disabled={actionLoading[indane.id]}
                                >
                                    {actionLoading[indane.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-24"
                                    onClick={() => handleUndoIndane(indane.id)}
                                    disabled={actionLoading[indane.id]}
                                >
                                    {actionLoading[indane.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Undo
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="w-24 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproveIndane(indane.id)}
                                    disabled={actionLoading[indane.id]}
                                >
                                    {actionLoading[indane.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Approved Material Indanes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Approved Material Indanes ({approvedIndanes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {approvedIndanes.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {approvedIndanes.map((indane) => (
                                <IndaneListItem
                                    key={indane.id}
                                    indane={indane}
                                    status="APPROVED"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No approved material indanes
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rejected Material Indanes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Rejected Material Indanes ({rejectedIndanes.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {rejectedIndanes.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                            {rejectedIndanes.map((indane) => (
                                <IndaneListItem
                                    key={indane.id}
                                    indane={indane}
                                    status="REJECTED"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No rejected material indanes
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal - Similar to Inventory Page */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Material Indane Details</DialogTitle>
                        <DialogDescription>
                            Complete information about this material indane
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIndane && (
                        <div className="space-y-6">
                            {/* Header Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Order Slip No
                                    </Label>
                                    <p className="text-base font-semibold">
                                        {selectedIndane.orderSlipNo}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Site
                                    </Label>
                                    <p className="text-base font-semibold">
                                        {selectedIndane.site}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Date
                                    </Label>
                                    <p className="text-base">
                                        {new Date(selectedIndane.date).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Store Keeper
                                    </Label>
                                    <p className="text-base">
                                        {selectedIndane.storeKeeperName}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Project Manager
                                    </Label>
                                    <p className="text-base">
                                        {selectedIndane.projectManagerName}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">
                                        Created By
                                    </Label>
                                    <p className="text-base">
                                        {selectedIndane.createdBy.name}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border-t pt-6">
                                <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                                    Material Items ({selectedIndane.items.length})
                                </Label>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2 font-semibold">Sl No</th>
                                                <th className="text-left p-2 font-semibold">Description</th>
                                                <th className="text-left p-2 font-semibold">Unit</th>
                                                <th className="text-right p-2 font-semibold">Required Qty</th>
                                                <th className="text-right p-2 font-semibold">Received Qty</th>
                                                <th className="text-right p-2 font-semibold">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedIndane.items.map((item) => (
                                                <tr key={item.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-2">{item.slNo}</td>
                                                    <td className="p-2">{item.materialDescription}</td>
                                                    <td className="p-2">{item.unit}</td>
                                                    <td className="p-2 text-right">{item.requiredQty}</td>
                                                    <td className="p-2 text-right">{item.receivedQty}</td>
                                                    <td className="p-2 text-right">{item.balance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Creator Info */}
                            <div className="border-t pt-6">
                                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Creator Information
                                </Label>
                                <p className="text-sm">
                                    <span className="font-medium">Name:</span> {selectedIndane.createdBy.name}
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium">Email:</span> {selectedIndane.createdBy.email}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MaterialIndaneTab;
