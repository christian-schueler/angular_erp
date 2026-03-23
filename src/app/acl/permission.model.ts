export type Role = 'admin' | 'manager' | 'user';

export type Permission = 'view' | 'create' | 'edit' | 'delete';

export interface RolePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface AclConfig {
  [role: string]: RolePermissions;
}
