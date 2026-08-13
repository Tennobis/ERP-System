import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Plus, ShoppingCart, Package, Users, TrendingUp, Loader2, AlertTriangle, ArrowLeft, Star, Sparkles, FileText } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useUserFilter } from "@/contexts/UserFilterContext";
import { UserFilterComponent } from "@/components/UserFilterComponent";
import { PageUserFilterProvider } from "@/components/PageUserFilterProvider";
import { User } from "@/types/user";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { PurchaseDashboard } from "@/components/purchase-management/purchase-dashboard";
import { toast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

const PurchaseManagementContent = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use UserFilter Context
  const { 
    targetUserId, 
    selectedUser, 
    currentUser,
    setSelectedUserId 
  } = useUserFilter();
  
  const userID = targetUserId || user?.id || ""

  // Function to get current tab from URL
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/procurement')) return 'procurement';
    if (path.includes('/vendors')) return 'vendors';
    return 'dashboard'; // default tab
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tabRoutes: Record<string, string> = {
      dashboard: '/purchase-management/dashboard',
      procurement: '/purchase-management/procurement',
      vendors: '/purchase-management/vendors'
    };
    navigate(tabRoutes[value]);
  };

  // Auto-reset on page change
  useEffect(() => {
    // Reset to current user on page load/change
    setSelectedUserId(null);
  }, []); // Empty dependency - runs once on mount

  // Function to fetch purchase data
  const fetchPurchaseData = async () => {
    if (!userID) return; // Don't fetch if no user ID
    
    try {
      const token =
        sessionStorage.getItem("jwt_token") ||
        localStorage.getItem("jwt_token_backup");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log("Fetching purchase data for user:", userID);
      
      // Add any purchase-specific data fetching here
      // Example: fetch purchase orders, vendor data, etc.
      // const purchaseResponse = await fetch(`${API_URL}/purchases?userId=${userID}`, { headers });
      
    } catch (error) {
      console.error('Error fetching purchase data:', error);
    }
  };

  // Use effect to fetch data when targetUserId changes
  useEffect(() => {
    if (userID) {
      fetchPurchaseData();
    }
  }, [userID]); // Refetch when target user changes

  return (
    <div className="space-y-6">
      {/* User Filter Component */}
      <UserFilterComponent />

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Purchase Management
            {selectedUser && selectedUser.id !== currentUser?.id && (
              <span className="text-lg text-muted-foreground ml-2">
                - {selectedUser.name}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">Manage all your purchases</p>
        </div>
      </div>

      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6">
        <PurchaseDashboard selectedUserId={userID} />
      </Tabs>
    </div>
  );
};

const PurchaseManagement = () => {
  return (
    <PageUserFilterProvider allowedRoles={['project', 'store']}>
      <PurchaseManagementContent />
    </PageUserFilterProvider>
  );
};

export default PurchaseManagement;