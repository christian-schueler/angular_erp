import { Routes } from '@angular/router';
<<<<<<< HEAD
import { LayoutComponent } from './layout/layout.component';
import { CustomersComponent } from './customers/customers.component';
import { EmployeesComponent } from './employees/employees.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'customers', pathMatch: 'full' },
      { path: 'customers', component: CustomersComponent },
      { path: 'employees', component: EmployeesComponent },
    ],
  },
];
=======

export const routes: Routes = [];
>>>>>>> f630513 (initial commit)
