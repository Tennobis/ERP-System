export const ROLES = {
  ADMIN: 'admin',
  MD: 'md',
  CLIENT_MANAGER: 'client-manager',
  STORE: 'store',
  ACCOUNTS: 'accounts',
  SITE: 'site',
  CLIENT: 'client',
  HR: 'hr',
  PROJECT: 'project',
  WAREHOUSE: 'warehouse',
  TENDER: 'tender'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.MD]: ['read:*', 'write:*', 'delete:*'],
  [ROLES.CLIENT_MANAGER]: ['read:clients', 'write:clients', 'read:projects', 'write:projects'],
  [ROLES.STORE]: ['read:inventory', 'write:inventory', 'read:orders'],
  [ROLES.ACCOUNTS]: ['read:finances', 'write:finances', 'read:invoices'],
  [ROLES.SITE]: ['read:projects', 'write:reports', 'read:inventory'],
  [ROLES.CLIENT]: ['read:own-projects', 'write:comments'],
  [ROLES.HR]: ['read:hr', 'write:hr'],
  [ROLES.PROJECT]: ['read:projects', 'write:projects'],
  [ROLES.WAREHOUSE]: ['read:inventory', 'write:inventory', 'manage:shipments'],
  [ROLES.TENDER]: ['read:tenders', 'write:tenders', 'manage:submissions']
}; 