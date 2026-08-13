import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Loader2, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
// Remove: import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

interface InvitationData {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
  encryptedData: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("client"); // Default role
  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, error } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast(); // Extract token from URL query parameters and validate it
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviteToken = params.get("token");

    if (inviteToken) {
      setToken(inviteToken);
      validateToken(inviteToken);
    } else {
      // No token, reset validation states
      setIsTokenValid(false);
      setIsValidatingToken(false);
    }
  }, [location]);

  // Validate the invitation token using backend API
  const validateToken = async (inviteToken: string) => {
    setIsValidatingToken(true);
    try {
      if (!inviteToken.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error("Invalid token format");
      }
      // Call backend to validate token
      const response = await axios.post(`${API_URL}/invitations/validate-token`, { token: inviteToken });
      const invitation: InvitationData = response.data;
      
      if (!invitation) {
        throw new Error("Invalid invitation token");
      }
      
      if (!invitation.name || !invitation.email || !invitation.role) {
        throw new Error("Incomplete invitation data");
      }
      
      // Check if invitation has expired
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        throw new Error("Invitation token has expired");
      }
      
      // Check if invitation has already been used
      if (invitation.used) {
        throw new Error("Invitation token has already been used");
      }
      
      setName(invitation.name);
      setEmail(invitation.email);
      setRole(invitation.role);
      setIsTokenValid(true);
    } catch (err: any) {
      console.error("Token validation error:", err);
      setIsTokenValid(false);
      const errorMessage = err.response?.data?.error || err.message || "Invalid invitation token";
      toast({
        title: "Invalid Invitation",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      setTimeout(() => {
        navigate("/unauthorized", {
          state: { error: errorMessage },
        });
      }, 2000);
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Validate passwords match in real-time
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    try {
      setIsSubmitting(true);
      if (token) {
        if (!isTokenValid) {
          throw new Error("Invalid or expired invitation token");
        }
        // Optionally, revalidate token before submit (optional)
        // await validateToken(token);
      }
      // Register user
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        invitationToken: token,
      });
      toast({
        title: "Registration successful",
        description: "You can now log in to your account",
        duration: 3000,
      });
      navigate("/login", {
        state: {
          email,
          message: "Registration successful! Please log in with your credentials.",
        },
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "An error occurred during registration";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while validating token
  if (token && isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Validating your invitation...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">ConstructFlow ERP</CardTitle>
          <CardDescription>
            {token ? "Complete your account setup" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  readOnly={!!token}
                  className={token ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@constructflow.com"
                  required
                  readOnly={!!token}
                  className={token ? "bg-muted cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={passwordError ? "border-destructive" : ""}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground focus:outline-none"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              {password && confirmPassword && (
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 ease-in-out ${
                    password === confirmPassword 
                      ? "border-green-500 bg-green-500" 
                      : "border-red-400 bg-red-50"
                  }`}>
                    {password === confirmPassword && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      password === confirmPassword 
                        ? "text-green-700" 
                        : "text-red-600"
                    }`}
                  >
                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  type="text"
                  value={role}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !!passwordError || (token && !isTokenValid)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        {/* <CardFooter className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground mt-4 text-center">
            <p>
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default Register;