import { Routes } from '@angular/router';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./warehouse-list/warehouse-list.component').then(
        m => m.WarehouseListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./warehouse-add/warehouse-add.component').then(
        m => m.WarehouseAddComponent
      ),
  },

];
