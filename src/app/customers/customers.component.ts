import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { Customer } from '../models/customer.model';
import { AclService } from '../acl/acl.service';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="master-detail">
      <aside class="explorer">
        <div class="explorer-header">
          <h3>Customers</h3>
          @if (aclService.can('create')) {
            <button class="btn-add" (click)="addCustomer()">+ Add</button>
          }
        </div>
        <div class="customer-list">
          @for (customer of dataService.customers(); track customer.id) {
            <div
              class="customer-item"
              [class.selected]="selectedCustomerId() === customer.id"
              (click)="selectCustomer(customer)"
            >
              <div class="customer-info">
                <span class="customer-name">{{ customer.name }}</span>
                <span class="customer-email">{{ customer.email }}</span>
              </div>
              @if (aclService.can('delete')) {
                <button
                  class="btn-delete"
                  (click)="deleteCustomer($event, customer)"
                  title="Delete"
                >
                  🗑️
                </button>
              }
            </div>
          }
          @if (dataService.customers().length === 0) {
            <div class="empty-list">No customers yet</div>
          }
        </div>
      </aside>

      <main class="editor">
        @if (editingCustomer()) {
          <div class="editor-header">
            <h3>{{ isNewCustomer() ? 'New Customer' : 'Edit Customer' }}</h3>
            @if (!isNewCustomer()) {
              <span class="nav-indicator">
                {{ getCurrentPosition() }} of {{ dataService.customers().length }}
              </span>
            }
          </div>

          <form class="edit-form" (ngSubmit)="saveCustomer()">
            <div class="form-grid">
              <div class="form-group">
                <label>Name *</label>
                <input [(ngModel)]="formData.name" name="name" required />
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
                <label>City</label>
                <input [(ngModel)]="formData.city" name="city" />
              </div>
              <div class="form-group">
                <label>Country</label>
                <input [(ngModel)]="formData.country" name="country" />
              </div>
              <div class="form-group">
                <label>Address</label>
                <input [(ngModel)]="formData.address" name="address" />
              </div>
            </div>

            <div class="form-actions">
              <div class="nav-buttons">
                @if (!isNewCustomer() && aclService.can('edit')) {
                  <button
                    type="button"
                    class="btn-nav"
                    [disabled]="dataService.isFirstCustomer(editingCustomer()!.id)"
                    (click)="navigatePrev()"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    class="btn-nav"
                    [disabled]="dataService.isLastCustomer(editingCustomer()!.id)"
                    (click)="navigateNext()"
                  >
                    Next →
                  </button>
                }
              </div>
              <div class="action-buttons">
                @if (aclService.can('delete') && !isNewCustomer()) {
                  <button type="button" class="btn-danger" (click)="deleteCurrentCustomer()">
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
            <p>Select a customer to edit</p>
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

      .customer-list {
        flex: 1;
        overflow-y: auto;
      }

      .customer-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: all 0.15s;
        border-left: 3px solid transparent;
      }

      .customer-item:hover {
        background: #f9fafb;
      }

      .customer-item.selected {
        background: #eef2ff;
        border-left-color: #4f46e5;
      }

      .customer-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .customer-name {
        font-weight: 500;
        color: #111827;
        font-size: 14px;
      }

      .customer-email {
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

      .form-group input {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
      }

      .form-group input:focus {
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
export class CustomersComponent {
  dataService = inject(DataService);
  aclService = inject(AclService);

  selectedCustomerId = signal<number | null>(null);
  editingCustomer = signal<Customer | null>(null);
  isSaving = signal(false);
  formData = { name: '', email: '', phone: '', address: '', city: '', country: '' };

  constructor() {
    const customers = this.dataService.customers();
    if (customers.length > 0) {
      this.selectCustomer(customers[0]);
    }
  }

  selectCustomer(customer: Customer): void {
    if (this.hasUnsavedChanges()) {
      const result = confirm('You have unsaved changes. Save before switching?');
      if (result) {
        this.saveCustomer();
      } else if (result === false) {
        return;
      }
    }
    this.selectedCustomerId.set(customer.id);
    this.editingCustomer.set(customer);
    this.formData = { ...customer };
  }

  addCustomer(): void {
    if (this.hasUnsavedChanges()) {
      const result = confirm('You have unsaved changes. Save before creating new?');
      if (result) {
        this.saveCustomer();
      } else if (result === false) {
        return;
      }
    }
    this.selectedCustomerId.set(null);
    this.editingCustomer.set({
      id: 0,
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      createdAt: new Date(),
    });
    this.formData = { name: '', email: '', phone: '', address: '', city: '', country: '' };
  }

  isNewCustomer(): boolean {
    return this.editingCustomer()?.id === 0;
  }

  getCurrentPosition(): number {
    const customer = this.editingCustomer();
    if (!customer || customer.id === 0) return 0;
    return this.dataService.getCustomerIndex(customer.id) + 1;
  }

  hasUnsavedChanges(): boolean {
    const original = this.editingCustomer();
    if (!original) return false;
    return (
      original.name !== this.formData.name ||
      original.email !== this.formData.email ||
      original.phone !== this.formData.phone ||
      original.address !== this.formData.address ||
      original.city !== this.formData.city ||
      original.country !== this.formData.country
    );
  }

  navigatePrev(): void {
    const current = this.editingCustomer();
    if (!current) return;
    const prev = this.dataService.getPreviousCustomer(current.id);
    if (prev) {
      this.selectCustomer(prev);
    }
  }

  navigateNext(): void {
    const current = this.editingCustomer();
    if (!current) return;
    const next = this.dataService.getNextCustomer(current.id);
    if (next) {
      this.selectCustomer(next);
    }
  }

  saveCustomer(): void {
    if (!this.formData.name || !this.formData.email) {
      alert('Name and email are required');
      return;
    }

    this.isSaving.set(true);

    setTimeout(() => {
      if (this.isNewCustomer()) {
        this.dataService.addCustomer(this.formData);
        const customers = this.dataService.customers();
        const newCustomer = customers[customers.length - 1];
        this.selectedCustomerId.set(newCustomer.id);
        this.editingCustomer.set(newCustomer);
      } else {
        const current = this.editingCustomer();
        if (current) {
          this.dataService.updateCustomer(current.id, this.formData);
          this.editingCustomer.set({ ...current, ...this.formData });
        }
      }
      this.isSaving.set(false);
    }, 300);
  }

  cancelEdit(): void {
    const customers = this.dataService.customers();
    if (customers.length > 0) {
      this.selectCustomer(customers[0]);
    } else {
      this.editingCustomer.set(null);
      this.selectedCustomerId.set(null);
    }
  }

  deleteCustomer(event: Event, customer: Customer): void {
    event.stopPropagation();
    if (confirm(`Delete customer "${customer.name}"?`)) {
      this.dataService.deleteCustomer(customer.id);
      if (this.selectedCustomerId() === customer.id) {
        const customers = this.dataService.customers();
        if (customers.length > 0) {
          this.selectCustomer(customers[0]);
        } else {
          this.editingCustomer.set(null);
          this.selectedCustomerId.set(null);
        }
      }
    }
  }

  deleteCurrentCustomer(): void {
    const customer = this.editingCustomer();
    if (!customer || this.isNewCustomer()) return;

    if (confirm(`Delete customer "${customer.name}"?`)) {
      const customers = this.dataService.customers();
      const currentIndex = this.dataService.getCustomerIndex(customer.id);
      this.dataService.deleteCustomer(customer.id);

      if (customers.length > 1) {
        const newIndex = Math.min(currentIndex, customers.length - 2);
        this.selectCustomer(customers[newIndex]);
      } else {
        this.editingCustomer.set(null);
        this.selectedCustomerId.set(null);
      }
    }
  }
}
