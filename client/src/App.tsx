
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarMobile } from "@/components/app-sidebar-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUser } from "@/contexts/UserContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import MDDashboard from "./pages/MDDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DesignDashboard from "./pages/DesignDashboard";
import ClientManagerDashboard from "./pages/ClientManagerDashboard";
import StoreDashboard from "./pages/StoreDashboard";
import AccountsDashboard from "./pages/AccountsDashboard";
import SiteDashboard from "./pages/SiteDashboard";
import ClientPortal from "./pages/ClientPortal";
import ActiveTasksPage from "./pages/ActiveTasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";

// ERP Module Pages
import Projects from "./pages/Projects";
import HR from "./pages/HR";
import Inventory from "./pages/Inventory";
import Documents from "./pages/Documents";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// New ERP Feature Pages
import TenderManagement from "./pages/TenderManagement";
import BillingManagement from "./pages/BillingManagement";
import PurchaseManagement from "./pages/PurchaseManagement";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import { UserFilterProvider } from "./contexts/UserFilterContext";


const queryClient = new QueryClient();

const AppLayout = () => {
  const { user, isLoading, isInitialized, retryAuth } = useUser();
  
  // Show loading while initializing authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user has a token but no user data (network error scenario)
  const hasToken = sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
  if (!user && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Issue</h3>
          <p className="text-gray-600 mb-6">
            Unable to verify your authentication. This might be due to a temporary network issue.
          </p>
          <div className="space-y-3">
            <button
              onClick={retryAuth}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem("jwt_token");
                localStorage.removeItem("jwt_token_backup");
                window.location.href = "/login";
              }}
              className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Only redirect to login if we're sure the user is not authenticated
  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <main className="flex-1">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              {/* Mobile Sidebar Trigger - Only visible on mobile */}
              <AppSidebarMobile className="mr-2" />
              <div className="ml-auto flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-muted-foreground">
                  Construction Management System
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <Routes>
              <Route index element={<Index />} />
              <Route path="/md-dashboard" element={<MDDashboard />} />
              <Route path="/md-dashboard/executive" element={<MDDashboard />} />
              <Route path="/md-dashboard/projects" element={<MDDashboard />} />
              <Route path="/md-dashboard/financials" element={<MDDashboard />} />

              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/design-dashboard" element={<DesignDashboard />} />
              <Route path="/client-manager" element={<ClientManagerDashboard />} />
              <Route path="/store-manager" element={<StoreDashboard />} />
              <Route path="/accounts-manager" element={<AccountsDashboard />} />
              <Route path="/site-manager" element={<SiteDashboard />} />
              <Route path="/site-manager/timeline" element={<SiteDashboard />} />
              <Route path="/site-manager/reports" element={<SiteDashboard />} />
              <Route path="/site-manager/central-warehouse" element={<SiteDashboard />} />
              <Route path="/site-manager/invoices" element={<SiteDashboard />} />
              <Route path="/active-tasks" element={<ActiveTasksPage />} />
              <Route path="/active-tasks/:taskId" element={<TaskDetailPage />} />

              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/client-portal/designs" element={<ClientPortal />} />
              <Route path="/client-portal/financials" element={<ClientPortal />} />
              <Route path="/client-portal/progress" element={<ClientPortal />} />
              <Route path="/client-portal/documents" element={<ClientPortal />} />
              
              {/* ERP module pages */}
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/overview" element={<Projects />} />
              <Route path="/projects/list" element={<Projects />} />
              <Route path="/projects/milestone" element={<Projects />} />

              <Route path="/hr" element={<HR />} />
              <Route path="/hr/employees" element={<HR />} />
              <Route path="/hr/salaries" element={<HR />} />

              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/inventory" element={<Inventory />} />
              <Route path="/inventory/material-forecast" element={<Inventory />} />
              <Route path="/inventory/issue-tracking" element={<Inventory />} />
              <Route path="/inventory/transfers" element={<Inventory />} />
              <Route path="/inventory/warehouse" element={<Inventory />} />
              <Route path="/inventory/material-indent" element={<Inventory />} />

              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/all" element={<Documents />} />
              <Route path="/documents/my" element={<Documents />} />

              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Dashboard deep links */}
              <Route path="/admin-dashboard/monitoring" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/users" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/modules" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/security" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/logs" element={<AdminDashboard />} />

              <Route path="/design-dashboard/overview" element={<DesignDashboard />} />
              <Route path="/design-dashboard/queue" element={<DesignDashboard />} />

              <Route path="/client-manager/engagement" element={<ClientManagerDashboard />} />
              <Route path="/client-manager/billing" element={<ClientManagerDashboard />} />

              <Route path="/store-manager/overview" element={<StoreDashboard />} />
              <Route path="/store-manager/analytics" element={<StoreDashboard />} />
              <Route path="/store-manager/vehicle-tracking" element={<StoreDashboard />} />
              <Route path="/store-manager/store-staffs" element={<StoreDashboard />} />

              <Route path="/accounts-manager/overview" element={<AccountsDashboard />} />
              <Route path="/accounts-manager/invoicing" element={<AccountsDashboard />} />
              <Route path="/accounts-manager/budget" element={<AccountsDashboard />} />
              <Route path="/accounts-manager/payroll" element={<AccountsDashboard />} />
              <Route path="/accounts-manager/taxes" element={<AccountsDashboard />} />
              <Route path="/accounts-manager/client-bill" element={<AccountsDashboard />} />

              <Route path="/site-manager/timeline" element={<SiteDashboard />} />
              <Route path="/site-manager/reports" element={<SiteDashboard />} />
              <Route path="/site-manager/central-warehouse" element={<SiteDashboard />} />
              
              {/* New ERP feature pages */}
              <Route path="/tender-management" element={<TenderManagement />} />
              <Route path="/tender-management/dashboard" element={<TenderManagement />} />
              <Route path="/tender-management/preparation" element={<TenderManagement />} />
              <Route path="/tender-management/tracking" element={<TenderManagement />} />
              <Route path="/tender-management/active-tenders" element={<TenderManagement />} />
              
              <Route path="/billing-management" element={<BillingManagement />} />
              <Route path="/billing-management/overview" element={<BillingManagement />} />
              <Route path="/billing-management/invoices" element={<BillingManagement />} />
              <Route path="/billing-management/payments" element={<BillingManagement />} />
              <Route path="/billing-management/requests" element={<BillingManagement />} />
              <Route path="/billing-management/material-indanes" element={<BillingManagement />} />
              
              <Route path="/purchase-management" element={<PurchaseManagement />} />
              <Route path="/purchase-management/overview" element={<PurchaseManagement />} />
              <Route path="/purchase-management/material-requests" element={<PurchaseManagement />} />
              <Route path="/purchase-management/purchase-orders" element={<PurchaseManagement />} />
              <Route path="/purchase-management/vendors" element={<PurchaseManagement />} />

              <Route path="/warehouse-management" element={<WarehouseDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <UserProvider>
              <AppWithUser />
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const AppWithUser = () => {
  const { user } = useUser();
  
  return (
    <UserFilterProvider 
      currentUser={user}
      apiUrl={import.meta.env.VITE_API_URL}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </UserFilterProvider>
  );
};

export default App;
