import React from 'react';
import { Users, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUserFilter } from '@/contexts/UserFilterContext';

interface UserFilterComponentProps {
  className?: string;
  showRefreshButton?: boolean;
}

export const UserFilterComponent: React.FC<UserFilterComponentProps> = ({
  className = "",
  showRefreshButton = true
}) => {
  const {
    currentUser,
    allUsers,
    selectedUserId,
    selectedUser,
    isLoadingUsers,
    setSelectedUserId,
    refreshUsers,
    isAdminUser
  } = useUserFilter();

  // Don't render if user doesn't have admin privileges
  if (!isAdminUser()) {
    return null;
  }

  const handleRefresh = async () => {
    await refreshUsers();
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-muted/50 rounded-lg border ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <Label className="text-sm hidden md:block font-medium">View data for:</Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={selectedUserId || currentUser?.id || ""} 
            onValueChange={(value) => setSelectedUserId(value === currentUser?.id ? null : value)}
            disabled={isLoadingUsers}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select user to view data for" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentUser?.id || ""}>
                Current User ({currentUser?.name})
              </SelectItem>
              {allUsers
                .filter(user => user.id !== currentUser?.id)
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} - {user.role}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingUsers}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              {isLoadingUsers ? 'Loading...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="text-sm hidden md:block text-muted-foreground">
          Currently viewing: {selectedUser.name}
          {selectedUserId && ` (${selectedUser.role})`}
        </div>
      )}
    </div>
  );
};