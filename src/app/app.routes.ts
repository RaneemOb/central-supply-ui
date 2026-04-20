import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models/common.models';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        m => m.LoginComponent
      ),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layouts/app-layout.component').then(
        m => m.AppLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            m => m.DashboardComponent
          ),
      },
      {
        path: 'warehouse',
        canActivate: [roleGuard([UserRole.MANAGER])],
        loadChildren: () =>
          import('./features/warehouse/warehouse.routes').then(
            m => m.WAREHOUSE_ROUTES
          ),
      },
      {
        path: 'supply-documents',
        loadChildren: () =>
          import('./features/supply-document/supply-document.routes').then(
            m => m.SUPPLY_DOCUMENT_ROUTES
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
