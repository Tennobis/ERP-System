import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/contexts/UserContext";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ allowedRoles, redirectPath }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Special handling for the home route - both admin and IT users can access it
  if (location.pathname === "/" && !(user?.role === "admin")) {
    // Redirect users to their specific dashboard based on role
    const roleDashboardMap: Record<UserRole, string> = {
      "admin": "/admin-dashboard",
      "md": "/md-dashboard",
      "client-manager": "/client-manager",
      "store": "/store-manager",
      "accounts": "/accounts-manager",
      // "site": "/site-manager",
      "client": "/client-portal",
      "hr": "/hr",
      "project": "/projects",
      "warehouse": "/warehouse-management",
      "tender": "/tender-management"
    };
    
    return <Navigate to={roleDashboardMap[user.role]} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={redirectPath || "/unauthorized"} replace />;
  }

  return <Outlet />;
};
