import { Routes } from '@angular/router';

export const SUPPLY_DOCUMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./document-list/document-list.component').then(
        m => m.DocumentListComponent
      ),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./document-add/document-add.component').then(
        m => m.DocumentAddComponent
      ),
  },
];
