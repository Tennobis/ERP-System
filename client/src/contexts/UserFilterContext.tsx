import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
  id: string;
  name: string;
  role: 'admin' | 'md' | 'project' | string;
}

interface CurrentUser extends User {
  // Add any additional properties specific to the current user
  id: string;
  name: string;
  role: 'admin' | 'md' | 'project' | string;

}

interface UserFilterContextType {
  // Current user data
  currentUser: CurrentUser | null;
  
  // All users available for filtering
  allUsers: User[];
  
  // Selected user ID for filtering (null means current user)
  selectedUserId: string | null;
  
  // Target user ID that should be used for API calls
  targetUserId: string | null;
  
  // Selected user object
  selectedUser: User | null;
  
  // Loading states
  isLoadingUsers: boolean;
  
  // Actions
  setSelectedUserId: (userId: string | null) => void;
  refreshUsers: () => Promise<void>;
  
  // Helper methods
  canAccessUserData: (userId: string) => boolean;
  isAdminUser: () => boolean;
}

const UserFilterContext = createContext<UserFilterContextType | undefined>(undefined);

// Custom hook to use the context
export const useUserFilter = () => {
  const context = useContext(UserFilterContext);
  if (!context) {
    throw new Error('useUserFilter must be used within a UserFilterProvider');
  }
  return context;
};

// Provider Props
interface UserFilterProviderProps {
  children: ReactNode;
  currentUser: CurrentUser | null;
  apiUrl?: string;
  allowedRoles?: string[]; // Roles that can be filtered/viewed by admin/md users
}

export const UserFilterProvider: React.FC<UserFilterProviderProps> = ({
  children,
  currentUser,
  apiUrl = import.meta.env.VITE_API_URL || '',
  allowedRoles = ['admin'] // Default to 'site' role if not specified
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Helper function to check if user has admin privileges
  const isAdminUser = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'md' || currentUser?.role === 'warehouse';
  };

  // Helper function to check if current user can access another user's data
  const canAccessUserData = (userId: string) => {
    if (!currentUser) return false;
    
    // User can always access their own data
    if (userId === currentUser.id) return true;
    
    // Only admin/md can access other users' data
    return isAdminUser();
  };

  // Get the target user ID for API calls
  const targetUserId = selectedUserId || currentUser?.id || null;

  // Get the selected user object
  const selectedUser = selectedUserId 
    ? allUsers.find(user => user.id === selectedUserId) || null
    : currentUser;

  // Fetch all users function
  const fetchAllUsers = async () => {
    if (!currentUser || !isAdminUser()) {
      setAllUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const token = sessionStorage.getItem("jwt_token") || 
                   localStorage.getItem("jwt_token_backup");
      
      if (!token) {
        console.error("No authentication token found");
        setAllUsers([]);
        return;
      }

      const response = await fetch(`${apiUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to only show users that the current user can access
        const accessibleUsers = data.filter((user: User) => 
          allowedRoles.includes(user.role) || user.id === currentUser.id
        );
        setAllUsers(accessibleUsers);
      } else {
        console.error("Failed to fetch all users:", response.status);
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Refresh users function (exposed to components)
  const refreshUsers = async () => {
    await fetchAllUsers();
  };

  // Handle selected user ID changes with validation
  const handleSetSelectedUserId = (userId: string | null) => {
    // Reset to null if user doesn't have admin privileges
    if (!isAdminUser()) {
      setSelectedUserId(null);
      return;
    }

    // Validate that the user can access the selected user's data
    if (userId && !canAccessUserData(userId)) {
      console.warn(`Access denied for user ${userId}`);
      setSelectedUserId(null);
      return;
    }

    setSelectedUserId(userId);
  };

  // Effect to fetch users when current user changes
  useEffect(() => {
    if (currentUser && isAdminUser()) {
      fetchAllUsers();
    } else {
      setAllUsers([]);
      setSelectedUserId(null);
    }
  }, [currentUser?.id, currentUser?.role]);

  // Effect to reset selectedUserId when user loses admin privileges
  useEffect(() => {
    if (!isAdminUser()) {
      setSelectedUserId(null);
    }
  }, [currentUser?.role]);

  const contextValue: UserFilterContextType = {
    currentUser,
    allUsers,
    selectedUserId,
    targetUserId,
    selectedUser,
    isLoadingUsers,
    setSelectedUserId: handleSetSelectedUserId,
    refreshUsers,
    canAccessUserData,
    isAdminUser
  };

  return (
    <UserFilterContext.Provider value={contextValue}>
      {children}
    </UserFilterContext.Provider>
  );
};