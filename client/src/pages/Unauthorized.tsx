
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  // Determine the appropriate dashboard based on the user's role
  const getDashboardForRole = () => {
    if (!user) return "/";
    
    const roleDashboardMap = {
      "admin": "/",
      "md": "/md-dashboard",
      "design": "/design-dashboard",
      "client-manager": "/client-manager",
      "store": "/store-manager",
      "accounts": "/accounts-manager",
      "site": "/site-manager",
      "client": "/client-portal"
    };
    
    return roleDashboardMap[user.role] || "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Your current role ({user?.role}) doesn't have the necessary permissions to view this content.
            Please contact your system administrator if you believe this is an error.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate(getDashboardForRole())}>
            Go to My Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized;
