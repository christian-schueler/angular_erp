import { Injectable, signal, computed } from '@angular/core';
import { Customer } from './models/customer.model';
import { Employee } from './models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private customersSignal = signal<Customer[]>([
    {
      id: 1,
      name: 'Acme Corp',
      email: 'contact@acme.com',
      phone: '+1 555-0101',
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      name: 'TechStart Inc',
      email: 'info@techstart.io',
      phone: '+1 555-0102',
      address: '456 Innovation Ave',
      city: 'San Francisco',
      country: 'USA',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: 3,
      name: 'GlobalTrade Ltd',
      email: 'sales@globaltrade.com',
      phone: '+44 20-1234-5678',
      address: '10 Downing St',
      city: 'London',
      country: 'UK',
      createdAt: new Date('2024-03-10'),
    },
    {
      id: 4,
      name: 'EuroTech GmbH',
      email: 'kontakt@eurotech.de',
      phone: '+49 30-123456',
      address: 'Alexanderplatz 1',
      city: 'Berlin',
      country: 'Germany',
      createdAt: new Date('2024-04-05'),
    },
  ]);

  private employeesSignal = signal<Employee[]>([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1 555-1001',
      position: 'Software Engineer',
      department: 'IT',
      salary: 75000,
      hireDate: new Date('2022-01-10'),
      status: 'active',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1 555-1002',
      position: 'HR Manager',
      department: 'HR',
      salary: 65000,
      hireDate: new Date('2021-06-15'),
      status: 'active',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 555-1003',
      position: 'Sales Director',
      department: 'Sales',
      salary: 85000,
      hireDate: new Date('2020-03-01'),
      status: 'active',
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@company.com',
      phone: '+1 555-1004',
      position: 'Accountant',
      department: 'Finance',
      salary: 60000,
      hireDate: new Date('2023-02-28'),
      status: 'active',
    },
  ]);

  customers = computed(() => this.customersSignal());
  employees = computed(() => this.employeesSignal());

  getCustomer(id: number): Customer | undefined {
    return this.customersSignal().find((c) => c.id === id);
  }

  getEmployee(id: number): Employee | undefined {
    return this.employeesSignal().find((e) => e.id === id);
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): void {
    const newId = Math.max(...this.customersSignal().map((c) => c.id), 0) + 1;
    this.customersSignal.update((customers) => [
      ...customers,
      { ...customer, id: newId, createdAt: new Date() },
    ]);
  }

  updateCustomer(id: number, customer: Partial<Customer>): void {
    this.customersSignal.update((customers) =>
      customers.map((c) => (c.id === id ? { ...c, ...customer } : c)),
    );
  }

  deleteCustomer(id: number): void {
    this.customersSignal.update((customers) => customers.filter((c) => c.id !== id));
  }

  deleteEmployee(id: number): void {
    this.employeesSignal.update((employees) => employees.filter((e) => e.id !== id));
  }

  addEmployee(employee: Omit<Employee, 'id'>): void {
    const newId = Math.max(...this.employeesSignal().map((e) => e.id), 0) + 1;
    this.employeesSignal.update((employees) => [...employees, { ...employee, id: newId }]);
  }

  updateEmployee(id: number, employee: Partial<Employee>): void {
    this.employeesSignal.update((employees) =>
      employees.map((e) => (e.id === id ? { ...e, ...employee } : e)),
    );
  }

  getCustomerIndex(id: number): number {
    return this.customersSignal().findIndex((c) => c.id === id);
  }

  getPreviousCustomer(currentId: number): Customer | undefined {
    const customers = this.customersSignal();
    const index = customers.findIndex((c) => c.id === currentId);
    if (index > 0) {
      return customers[index - 1];
    }
    return undefined;
  }

  getNextCustomer(currentId: number): Customer | undefined {
    const customers = this.customersSignal();
    const index = customers.findIndex((c) => c.id === currentId);
    if (index < customers.length - 1) {
      return customers[index + 1];
    }
    return undefined;
  }

  isFirstCustomer(id: number): boolean {
    const customers = this.customersSignal();
    return customers.length > 0 && customers[0].id === id;
  }

  isLastCustomer(id: number): boolean {
    const customers = this.customersSignal();
    return customers.length > 0 && customers[customers.length - 1].id === id;
  }

  getEmployeeIndex(id: number): number {
    return this.employeesSignal().findIndex((e) => e.id === id);
  }

  getPreviousEmployee(currentId: number): Employee | undefined {
    const employees = this.employeesSignal();
    const index = employees.findIndex((e) => e.id === currentId);
    if (index > 0) {
      return employees[index - 1];
    }
    return undefined;
  }

  getNextEmployee(currentId: number): Employee | undefined {
    const employees = this.employeesSignal();
    const index = employees.findIndex((e) => e.id === currentId);
    if (index < employees.length - 1) {
      return employees[index + 1];
    }
    return undefined;
  }

  isFirstEmployee(id: number): boolean {
    const employees = this.employeesSignal();
    return employees.length > 0 && employees[0].id === id;
  }

  isLastEmployee(id: number): boolean {
    const employees = this.employeesSignal();
    return employees.length > 0 && employees[employees.length - 1].id === id;
  }
}
