// InvitationData type for use throughout the client
export interface InvitationData {
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