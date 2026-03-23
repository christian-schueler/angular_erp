import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AclService } from '../acl/acl.service';
import { Role } from '../acl/permission.model';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">ERP System</div>
        <nav>
          <a routerLink="/customers" routerLinkActive="active">
            <span class="icon">👥</span> Customers
          </a>
          <a routerLink="/employees" routerLinkActive="active">
            <span class="icon">👔</span> Employees
          </a>
        </nav>
        <div class="role-switcher">
          <label>Role:</label>
          <select [(ngModel)]="currentRole" (ngModelChange)="onRoleChange($event)">
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        <div class="permissions-info">
          <div class="permissions-title">Your Permissions:</div>
          <div class="permission-item">
            <span class="dot" [class.active]="aclService.can('view')"></span> View
          </div>
          <div class="permission-item">
            <span class="dot" [class.active]="aclService.can('create')"></span> Create
          </div>
          <div class="permission-item">
            <span class="dot" [class.active]="aclService.can('edit')"></span> Edit
          </div>
          <div class="permission-item">
            <span class="dot" [class.active]="aclService.can('delete')"></span> Delete
          </div>
        </div>
      </aside>
      <main class="content">
        <header class="topbar">
          <h1>ERP Dashboard</h1>
          <div class="role-badge">{{ aclService.getRoleLabel(aclService.role()) }}</div>
        </header>
        <div class="main-content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .sidebar {
        width: 250px;
        background: #1a1a2e;
        color: white;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
      }
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
        padding: 0 20px 30px;
        border-bottom: 1px solid #333;
        margin-bottom: 20px;
      }
      nav {
        flex: 1;
      }
      nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        color: #a0a0a0;
        text-decoration: none;
        transition: all 0.2s;
      }
      nav a:hover,
      nav a.active {
        background: #16213e;
        color: white;
      }
      .icon {
        font-size: 1.2rem;
      }
      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .topbar {
        background: white;
        padding: 20px 30px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .topbar h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
      }
      .main-content {
        flex: 1;
        padding: 30px;
        overflow-y: auto;
        background: #f5f5f5;
      }

      .role-switcher {
        padding: 16px 20px;
        border-top: 1px solid #333;
        margin-top: auto;
      }
      .role-switcher label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        color: #6b7280;
        margin-bottom: 6px;
      }
      .role-switcher select {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #374151;
        border-radius: 6px;
        background: #111827;
        color: white;
        font-size: 14px;
        cursor: pointer;
      }
      .role-switcher select:focus {
        outline: none;
        border-color: #4f46e5;
      }

      .permissions-info {
        padding: 16px 20px;
        border-top: 1px solid #333;
        font-size: 12px;
      }
      .permissions-title {
        color: #6b7280;
        margin-bottom: 8px;
        font-size: 11px;
        text-transform: uppercase;
      }
      .permission-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 0;
        color: #6b7280;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #374151;
      }
      .dot.active {
        background: #10b981;
      }

      .role-badge {
        background: #eef2ff;
        color: #4f46e5;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
      }
    `,
  ],
})
export class LayoutComponent {
  aclService = inject(AclService);
  currentRole: Role = this.aclService.getRole();

  onRoleChange(role: Role): void {
    this.aclService.setRole(role);
  }
}
