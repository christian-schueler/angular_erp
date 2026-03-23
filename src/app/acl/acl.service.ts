import { Injectable, signal, computed } from '@angular/core';
import { Role, Permission, RolePermissions, AclConfig } from './permission.model';

@Injectable({
  providedIn: 'root',
})
export class AclService {
  private currentRole = signal<Role>('user');

  private config: AclConfig = {
    admin: { view: true, create: true, edit: true, delete: true },
    manager: { view: true, create: true, edit: true, delete: false },
    user: { view: true, create: false, edit: false, delete: false },
  };

  role = computed(() => this.currentRole());

  can(action: Permission): boolean {
    return this.config[this.currentRole()]?.[action] ?? false;
  }

  canAny(actions: Permission[]): boolean {
    return actions.some((action) => this.can(action));
  }

  setRole(role: Role): void {
    this.currentRole.set(role);
  }

  getRole(): Role {
    return this.currentRole();
  }

  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      user: 'User',
    };
    return labels[role];
  }

  getPermissions(): RolePermissions {
    return this.config[this.currentRole()];
  }
}
