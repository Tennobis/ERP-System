
export type UserRole = 
  | 'admin' 
  | 'md' 
  | 'client-manager' 
  | 'store' 
  | 'accounts' 
  // | 'site'
  | 'client'
  | 'hr'
  | 'project';

export interface RolePermissions {
  projectManagement: boolean;
  tenderManagement: boolean;
  billingModule: boolean;
  assetsAndMachinery: boolean;
  purchaseManagement: boolean;
  accountsModule: boolean;
  qualityAssurance: boolean;
  centralStoreAccess: boolean;
  approvalAuthority: string[];
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: true,
    centralStoreAccess: true,
    approvalAuthority: ['all']
  },
  md: {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: true,
    centralStoreAccess: true,
    approvalAuthority: ['all']
  },
  store: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: true,
    purchaseManagement: true,
    accountsModule: false,
    qualityAssurance: true,
    centralStoreAccess: false,
    approvalAuthority: ['material-request', 'stock-update']
  },
  // site: {
  //   projectManagement: true,
  //   tenderManagement: false,
  //   billingModule: true,
  //   assetsAndMachinery: true,
  //   purchaseManagement: false,
  //   accountsModule: false,
  //   qualityAssurance: true,
  //   centralStoreAccess: false,
  //   approvalAuthority: ['project-milestone', 'labor-approval']
  // },
  accounts: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: true,
    accountsModule: true,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['payment-processing', 'expense-approval']
  },
  'client-manager': {
    projectManagement: true,
    tenderManagement: true,
    billingModule: true,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: ['client-communication']
  },
  client: {
    projectManagement: false,
    tenderManagement: false,
    billingModule: false,
    assetsAndMachinery: false,
    purchaseManagement: false,
    accountsModule: false,
    qualityAssurance: false,
    centralStoreAccess: false,
    approvalAuthority: []
  },
  hr: undefined,
  project: undefined
};
