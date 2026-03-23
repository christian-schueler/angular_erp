import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { Employee } from '../models/employee.model';
import { AclService } from '../acl/acl.service';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="master-detail">
      <aside class="explorer">
        <div class="explorer-header">
          <h3>Employees</h3>
          @if (aclService.can('create')) {
            <button class="btn-add" (click)="addEmployee()">+ Add</button>
          }
        </div>
        <div class="employee-list">
          @for (employee of dataService.employees(); track employee.id) {
            <div
              class="employee-item"
              [class.selected]="selectedEmployeeId() === employee.id"
              (click)="selectEmployee(employee)"
            >
              <div class="employee-info">
                <span class="employee-name">{{ employee.firstName }} {{ employee.lastName }}</span>
                <span class="employee-position">{{ employee.position }}</span>
              </div>
              @if (aclService.can('delete')) {
                <button
                  class="btn-delete"
                  (click)="deleteEmployee($event, employee)"
                  title="Delete"
                >
                  🗑️
                </button>
              }
            </div>
          }
          @if (dataService.employees().length === 0) {
            <div class="empty-list">No employees yet</div>
          }
        </div>
      </aside>

      <main class="editor">
        @if (editingEmployee()) {
          <div class="editor-header">
            <h3>{{ isNewEmployee() ? 'New Employee' : 'Edit Employee' }}</h3>
            @if (!isNewEmployee()) {
              <span class="nav-indicator">
                {{ getCurrentPosition() }} of {{ dataService.employees().length }}
              </span>
            }
          </div>

          <form class="edit-form" (ngSubmit)="saveEmployee()">
            <div class="form-grid">
              <div class="form-group">
                <label>First Name *</label>
                <input [(ngModel)]="formData.firstName" name="firstName" required />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input [(ngModel)]="formData.lastName" name="lastName" required />
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input [(ngModel)]="formData.email" name="email" type="email" required />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input [(ngModel)]="formData.phone" name="phone" />
              </div>
              <div class="form-group">
                <label>Position *</label>
                <input [(ngModel)]="formData.position" name="position" required />
              </div>
              <div class="form-group">
                <label>Department *</label>
                <input [(ngModel)]="formData.department" name="department" required />
              </div>
              <div class="form-group">
                <label>Salary</label>
                <input [(ngModel)]="formData.salary" name="salary" type="number" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="formData.status" name="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <div class="nav-buttons">
                @if (!isNewEmployee() && aclService.can('edit')) {
                  <button
                    type="button"
                    class="btn-nav"
                    [disabled]="dataService.isFirstEmployee(editingEmployee()!.id)"
                    (click)="navigatePrev()"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    class="btn-nav"
                    [disabled]="dataService.isLastEmployee(editingEmployee()!.id)"
                    (click)="navigateNext()"
                  >
                    Next →
                  </button>
                }
              </div>
              <div class="action-buttons">
                @if (aclService.can('delete') && !isNewEmployee()) {
                  <button type="button" class="btn-danger" (click)="deleteCurrentEmployee()">
                    Delete
                  </button>
                }
                <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancel</button>
                @if (aclService.can('create') || aclService.can('edit')) {
                  <button type="submit" class="btn-primary" [disabled]="isSaving()">
                    {{ isSaving() ? 'Saving...' : 'Save' }}
                  </button>
                }
              </div>
            </div>
          </form>
        } @else {
          <div class="no-selection">
            <p>Select an employee to edit</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .master-detail {
        display: flex;
        height: calc(100vh - 140px);
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .explorer {
        width: 30%;
        border-right: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
      }

      .explorer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .explorer-header h3 {
        margin: 0;
        font-size: 1rem;
        color: #374151;
      }

      .btn-add {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
      }

      .btn-add:hover {
        background: #4338ca;
      }

      .employee-list {
        flex: 1;
        overflow-y: auto;
      }

      .employee-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: all 0.15s;
        border-left: 3px solid transparent;
      }

      .employee-item:hover {
        background: #f9fafb;
      }

      .employee-item.selected {
        background: #eef2ff;
        border-left-color: #4f46e5;
      }

      .employee-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .employee-name {
        font-weight: 500;
        color: #111827;
        font-size: 14px;
      }

      .employee-position {
        font-size: 12px;
        color: #6b7280;
      }

      .btn-delete {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        opacity: 0.5;
        transition: opacity 0.15s;
      }

      .btn-delete:hover {
        opacity: 1;
      }

      .empty-list {
        padding: 20px;
        text-align: center;
        color: #9ca3af;
      }

      .editor {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .editor-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #111827;
      }

      .nav-indicator {
        font-size: 13px;
        color: #6b7280;
        background: #f3f4f6;
        padding: 4px 10px;
        border-radius: 12px;
      }

      .edit-form {
        max-width: 600px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 500;
        color: #4b5563;
      }

      .form-group input,
      .form-group select {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }

      .nav-buttons {
        display: flex;
        gap: 8px;
      }

      .btn-nav {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
      }

      .btn-nav:hover:not(:disabled) {
        background: #e5e7eb;
      }

      .btn-nav:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }

      .btn-primary {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }

      .btn-primary:hover:not(:disabled) {
        background: #4338ca;
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }

      .btn-secondary:hover {
        background: #f9fafb;
      }

      .btn-danger {
        background: #dc2626;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }

      .btn-danger:hover {
        background: #b91c1c;
      }

      .no-selection {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #9ca3af;
      }
    `,
  ],
})
export class EmployeesComponent {
  dataService = inject(DataService);
  aclService = inject(AclService);

  selectedEmployeeId = signal<number | null>(null);
  editingEmployee = signal<Employee | null>(null);
  isSaving = signal(false);
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    status: 'active' as 'active' | 'inactive',
  };

  constructor() {
    const employees = this.dataService.employees();
    if (employees.length > 0) {
      this.selectEmployee(employees[0]);
    }
  }

  selectEmployee(employee: Employee): void {
    if (this.hasUnsavedChanges()) {
      const result = confirm('You have unsaved changes. Save before switching?');
      if (result) {
        this.saveEmployee();
      } else if (result === false) {
        return;
      }
    }
    this.selectedEmployeeId.set(employee.id);
    this.editingEmployee.set(employee);
    this.formData = { ...employee };
  }

  addEmployee(): void {
    if (this.hasUnsavedChanges()) {
      const result = confirm('You have unsaved changes. Save before creating new?');
      if (result) {
        this.saveEmployee();
      } else if (result === false) {
        return;
      }
    }
    this.selectedEmployeeId.set(null);
    this.editingEmployee.set({
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 0,
      status: 'active',
      hireDate: new Date(),
    });
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 0,
      status: 'active',
    };
  }

  isNewEmployee(): boolean {
    return this.editingEmployee()?.id === 0;
  }

  getCurrentPosition(): number {
    const employee = this.editingEmployee();
    if (!employee || employee.id === 0) return 0;
    return this.dataService.getEmployeeIndex(employee.id) + 1;
  }

  hasUnsavedChanges(): boolean {
    const original = this.editingEmployee();
    if (!original) return false;
    return (
      original.firstName !== this.formData.firstName ||
      original.lastName !== this.formData.lastName ||
      original.email !== this.formData.email ||
      original.phone !== this.formData.phone ||
      original.position !== this.formData.position ||
      original.department !== this.formData.department ||
      original.salary !== this.formData.salary ||
      original.status !== this.formData.status
    );
  }

  navigatePrev(): void {
    const current = this.editingEmployee();
    if (!current) return;
    const prev = this.dataService.getPreviousEmployee(current.id);
    if (prev) {
      this.selectEmployee(prev);
    }
  }

  navigateNext(): void {
    const current = this.editingEmployee();
    if (!current) return;
    const next = this.dataService.getNextEmployee(current.id);
    if (next) {
      this.selectEmployee(next);
    }
  }

  saveEmployee(): void {
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email) {
      alert('First name, last name, and email are required');
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      if (this.isNewEmployee()) {
        this.dataService.addEmployee({
          ...this.formData,
          hireDate: new Date(),
        });
        const employees = this.dataService.employees();
        const newEmployee = employees[employees.length - 1];
        this.selectedEmployeeId.set(newEmployee.id);
        this.editingEmployee.set(newEmployee);
      } else {
        const current = this.editingEmployee();
        if (current) {
          this.dataService.updateEmployee(current.id, this.formData);
          this.editingEmployee.set({ ...current, ...this.formData });
        }
      }
      this.isSaving.set(false);
    }, 300);
  }

  cancelEdit(): void {
    const employees = this.dataService.employees();
    if (employees.length > 0) {
      this.selectEmployee(employees[0]);
    } else {
      this.editingEmployee.set(null);
      this.selectedEmployeeId.set(null);
    }
  }

  deleteEmployee(event: Event, employee: Employee): void {
    event.stopPropagation();
    if (confirm(`Delete employee "${employee.firstName} ${employee.lastName}"?`)) {
      this.dataService.deleteEmployee(employee.id);
      if (this.selectedEmployeeId() === employee.id) {
        const employees = this.dataService.employees();
        if (employees.length > 0) {
          this.selectEmployee(employees[0]);
        } else {
          this.editingEmployee.set(null);
          this.selectedEmployeeId.set(null);
        }
      }
    }
  }

  deleteCurrentEmployee(): void {
    const employee = this.editingEmployee();
    if (!employee || this.isNewEmployee()) return;

    if (confirm(`Delete employee "${employee.firstName} ${employee.lastName}"?`)) {
      const employees = this.dataService.employees();
      const currentIndex = this.dataService.getEmployeeIndex(employee.id);
      this.dataService.deleteEmployee(employee.id);

      if (employees.length > 1) {
        const newIndex = Math.min(currentIndex, employees.length - 2);
        this.selectEmployee(employees[newIndex]);
      } else {
        this.editingEmployee.set(null);
        this.selectedEmployeeId.set(null);
      }
    }
  }
}
