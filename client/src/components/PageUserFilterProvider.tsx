import React, { ReactNode } from 'react';
import { UserFilterProvider } from '@/contexts/UserFilterContext';
import { useUser } from '@/contexts/UserContext';

interface PageUserFilterProviderProps {
  children: ReactNode;
  allowedRoles: string[]; // Roles that can be filtered/viewed by admin/md users
}

export const PageUserFilterProvider: React.FC<PageUserFilterProviderProps> = ({
  children,
  allowedRoles
}) => {
  const { user } = useUser();
  
  return (
    <UserFilterProvider 
      currentUser={user}
      apiUrl={import.meta.env.VITE_API_URL}
      allowedRoles={allowedRoles}
    >
      {children}
    </UserFilterProvider>
  );
};
