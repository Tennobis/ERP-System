// User type for use throughout the client
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
} 