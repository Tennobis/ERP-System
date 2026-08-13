import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://testboard-266r.onrender.com/api";

export type UserRole =
  | "admin"
  | "md"
  | "client-manager"
  | "store"
  | "accounts"
  // | "site"
  | "client"
  | "hr"
  | "project"
  | "warehouse"
  | "tender";

interface User {
  id: string;
  name: string;
  email: string;
  role: string; // was UserRole
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_INITIALIZED"; payload: boolean }
  | { type: "RESET_AUTH" };

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload, isLoading: false };
    case "RESET_AUTH":
      return { ...initialState, isLoading: false, isInitialized: true };
    default:
      return state;
  }
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  retryAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to normalize role (underscore to hyphen)
function normalizeRole(role: string): string {
  return role.replace(/_/g, "-");
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const isLoggingOutRef = useRef(false);
  const mountedRef = useRef(true);
  const profileCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProfileCheckRef = useRef<number>(0);

  // Centralized navigation logic
  const navigateByRole = useCallback(
    (role: string) => {
      const roleRoutes: Record<string, string> = {
        admin: "/",
        md: "/md-dashboard",
        "client-manager": "/client-manager",
        store: "/store-manager",
        accounts: "/accounts-manager",
        site: "/site-manager",
        client: "/client-portal",
        hr: "/hr",
        project: "/projects",
        warehouse: "/warehouse-management",
        tender: "/tender-management"

      };
      navigate(roleRoutes[role] || "/");
    },
    [navigate]
  );

  // Helper function to check if we're on login page
  const isOnLoginPage = useCallback(() => {
    return window.location.pathname === "/login";
  }, []);

  // Helper function to check if we're on register page with token
  const isOnRegisterWithTokenPage = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname === "/register" && params.has("token");
  }, []);

  // Helper to get JWT from sessionStorage with localStorage fallback
  const getToken = () => {
    return sessionStorage.getItem("jwt_token") || localStorage.getItem("jwt_token_backup");
  };

  // Helper to set token in both storages
  const setToken = (token: string) => {
    sessionStorage.setItem("jwt_token", token);
    localStorage.setItem("jwt_token_backup", token);
  };

  // Helper to remove token from both storages
  const removeToken = () => {
    sessionStorage.removeItem("jwt_token");
    localStorage.removeItem("jwt_token_backup");
  };

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(
    async (token: string): Promise<User | null> => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
        if (!response.data) return null;
        // Normalize role
        return { ...response.data, role: normalizeRole(response.data.role) };
      } catch (error: any) {
        // Check if it's an authentication error (401) - token is invalid
        if (error.response?.status === 401) {
          return null;
        }
        // For network errors, timeouts, or server errors, keep the token
        // The user might still be authenticated, just can't reach the server right now
        console.warn('Failed to fetch user profile, but keeping token:', error.message);
        return null;
      }
    },
    []
  );

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        const { token } = response.data;
        if (!token) throw new Error("No token received from server");
        setToken(token);
        const user = await fetchUserProfile(token);
        if (!user) {
          throw new Error("Failed to fetch user profile");
        }
        // Normalize role
        dispatch({ type: "SET_USER", payload: { ...user, role: normalizeRole(user.role) } });
        dispatch({ type: "SET_ERROR", payload: null });
        navigateByRole(normalizeRole(user.role));
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || error.message || "Login failed" });
        dispatch({ type: "SET_USER", payload: null });
        throw error; // Re-throw the error so the Login component can handle it
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [fetchUserProfile, navigateByRole]
  );

  // Stop periodic profile checking
  const stopProfileChecking = useCallback(() => {
    if (profileCheckIntervalRef.current) {
      clearInterval(profileCheckIntervalRef.current);
      profileCheckIntervalRef.current = null;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return Promise.reject(new Error("Logout already in progress"));
    isLoggingOutRef.current = true;
    try {
      // Stop profile checking immediately
      stopProfileChecking();
      dispatch({ type: "RESET_AUTH" });
      const token = getToken();
      if (token) {
        try {
          await axios.post(`${API_URL}/auth/logout`, null, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
        } catch (error) {
          // Ignore backend logout errors
        }
      }
      removeToken();
      if (!isOnLoginPage()) navigate("/login", { replace: true });
    } catch (error) {
      dispatch({ type: "RESET_AUTH" });
      if (!isOnLoginPage()) navigate("/login", { replace: true });
      return Promise.reject(error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [navigate, isOnLoginPage, stopProfileChecking]);

  // Update profile function
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");
        const response = await axios.put(`${API_URL}/auth/profile`, updates, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: "SET_USER", payload: response.data });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || error.message || "Update failed" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  // Change password function
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");
        await axios.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword, confirmPassword }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error: any) {
        dispatch({ type: "SET_ERROR", payload: error.response?.data?.error || error.message || "Password change failed" });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  // Retry authentication function
  const retryAuth = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    
    dispatch({ type: "SET_LOADING", payload: true });
    const user = await fetchUserProfile(token);
    if (user) {
      dispatch({ type: "SET_USER", payload: user });
      dispatch({ type: "SET_ERROR", payload: null });
    } else {
      removeToken();
      dispatch({ type: "SET_USER", payload: null });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, [fetchUserProfile]);

  // Periodic profile check function
  const checkUserProfile = useCallback(async () => {
    const token = getToken();
    if (!token || isLoggingOutRef.current || !mountedRef.current) return;

    // Avoid too frequent checks (minimum 30 seconds between checks)
    const now = Date.now();
    if (now - lastProfileCheckRef.current < 30000) return;
    lastProfileCheckRef.current = now;

    try {
      const user = await fetchUserProfile(token);
      if (!mountedRef.current) return; // Component unmounted during fetch
      
      if (user) {
        // Update user data if it has changed
        if (JSON.stringify(state.user) !== JSON.stringify(user)) {
          dispatch({ type: "SET_USER", payload: user });
        }
      } else {
        // Token is invalid, log out the user
        removeToken();
        dispatch({ type: "RESET_AUTH" });
        if (!isOnLoginPage()) {
          navigate("/login", { replace: true });
        }
      }
      // If shouldRemoveToken is false, keep the current state (network error)
    } catch (error) {
      // Ignore errors in background checks
      console.warn('Background profile check failed:', error);
    }
  }, [fetchUserProfile, state.user, navigate, isOnLoginPage]);

  // Start periodic profile checking
  const startProfileChecking = useCallback(() => {
    if (profileCheckIntervalRef.current) return; // Already running
    
    // Check every 5 minutes
    profileCheckIntervalRef.current = setInterval(checkUserProfile, 5 * 60 * 1000);
    
    // Also check on window focus and visibility change (when user returns to tab)
    const handleFocus = () => checkUserProfile();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkUserProfile();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUserProfile]);

  // Initialize auth on mount
  useEffect(() => {
    mountedRef.current = true;
    const initializeAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const token = getToken();
      if (token) {
        const user = await fetchUserProfile(token);
        if (user) {
          dispatch({ type: "SET_USER", payload: { ...user, role: normalizeRole(user.role) } });
        } else {
          sessionStorage.removeItem("jwt_token");
          dispatch({ type: "SET_USER", payload: null });
        }
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
      dispatch({ type: "SET_INITIALIZED", payload: true });
      dispatch({ type: "SET_LOADING", payload: false });
    };
    initializeAuth();
    return () => {
      mountedRef.current = false;
      stopProfileChecking();
    };
  }, [fetchUserProfile, stopProfileChecking]);

  // Start/stop profile checking based on authentication status
  useEffect(() => {
    if (state.user && state.isInitialized) {
      // User is authenticated, start periodic checking
      const cleanup = startProfileChecking();
      return cleanup;
    } else {
      // User is not authenticated, stop checking
      stopProfileChecking();
    }
  }, [state.user, state.isInitialized, startProfileChecking, stopProfileChecking]);

  const value: UserContextType = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!state.user,
    retryAuth,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
