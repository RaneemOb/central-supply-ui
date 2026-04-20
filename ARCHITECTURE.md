# Central Supply Unit - Frontend Architecture

## Overview
Modern Angular 21 architecture using Standalone Components, Signals for state management, and feature-based module organization.

## Project Structure

```
src/
├── app/
│   ├── app.ts                          # Root component
│   ├── app.routes.ts                   # Main routing configuration
│   ├── app.config.ts                   # App configuration
│   │
│   ├── core/                           # Singleton services & global guards
│   │   ├── services/
│   │   │   ├── auth.service.ts         # Authentication & authorization
│   │   │   ├── api.service.ts          # HTTP client wrapper
│   │   │   └── error.service.ts        # Global error handling
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Route protection
│   │   │   └── role.guard.ts           # Role-based access control
│   │   │
│   │   └── interceptors/
│   │       └── auth.interceptor.ts     # JWT token injection
│   │
│   ├── shared/                         # Reusable components, pipes, directives
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── app-layout.component.ts       # Main layout
│   │   │   │   ├── header.component.ts           # Navigation header
│   │   │   │   ├── sidebar.component.ts          # Navigation sidebar
│   │   │   │   └── footer.component.ts           # Footer
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── loading-spinner.component.ts
│   │   │   │   ├── confirm-dialog.component.ts
│   │   │   │   ├── error-alert.component.ts
│   │   │   │   └── success-alert.component.ts
│   │   │   │
│   │   │   └── data-table/
│   │   │       ├── data-table.component.ts        # Reusable grid component
│   │   │       └── data-table.component.css
│   │   │
│   │   ├── pipes/
│   │   │   ├── safe-html.pipe.ts
│   │   │   └── date-format.pipe.ts
│   │   │
│   │   ├── directives/
│   │   │   ├── debounce-click.directive.ts
│   │   │   └── focus-trap.directive.ts
│   │   │
│   │   └── models/
│   │       └── common.models.ts         # Shared DTOs
│   │
│   ├── features/                       # Feature modules
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.css
│   │   │   │   └── login.routes.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── login.service.ts    # Auth API calls
│   │   │   │
│   │   │   └── models/
│   │   │       └── auth.models.ts      # User, Login DTOs
│   │   │
│   │   ├── warehouse/                  # Manager only
│   │   │   ├── warehouse-list/
│   │   │   │   ├── warehouse-list.component.ts
│   │   │   │   ├── warehouse-list.component.html
│   │   │   │   ├── warehouse-list.component.css
│   │   │   │   └── warehouse-list.routes.ts
│   │   │   │
│   │   │   ├── warehouse-add/
│   │   │   │   ├── warehouse-add.component.ts
│   │   │   │   ├── warehouse-add.component.html
│   │   │   │   ├── warehouse-add.component.css
│   │   │   │   │
│   │   │   │   └── item-grid/
│   │   │   │       ├── item-grid.component.ts     # Nested component
│   │   │   │       ├── item-grid.component.html
│   │   │   │       └── item-grid.component.css
│   │   │   │
│   │   │   ├── warehouse-view/
│   │   │   │   ├── warehouse-view.component.ts
│   │   │   │   ├── warehouse-view.component.html
│   │   │   │   └── warehouse-view.component.css
│   │   │   │
│   │   │   ├── warehouse-detail/
│   │   │   │   ├── warehouse-detail.component.ts
│   │   │   │   ├── warehouse-detail.component.html
│   │   │   │   └── warehouse-detail.component.css
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── warehouse.service.ts           # Warehouse API calls
│   │   │   │
│   │   │   └── models/
│   │   │       └── warehouse.models.ts            # Warehouse, Item DTOs
│   │   │
│   │   ├── supply-document/           # All users, different views
│   │   │   ├── document-list/
│   │   │   │   ├── employee-document-list.component.ts
│   │   │   │   ├── manager-document-list.component.ts
│   │   │   │   ├── document-list.routes.ts
│   │   │   │   └── document-list.component.html
│   │   │   │
│   │   │   ├── document-add/
│   │   │   │   ├── document-add.component.ts
│   │   │   │   ├── document-add.component.html
│   │   │   │   ├── document-add.component.css
│   │   │   │   │
│   │   │   │   └── warehouse-item-selector/
│   │   │   │       ├── warehouse-item-selector.component.ts
│   │   │   │       ├── warehouse-item-selector.component.html
│   │   │   │       └── warehouse-item-selector.component.css
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── supply-document.service.ts     # Document API calls
│   │   │   │
│   │   │   └── models/
│   │   │       └── supply-document.models.ts      # Document DTOs
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.component.ts
│   │       ├── dashboard.component.html
│   │       └── dashboard.component.css
│   │
│   └── styles/
│       ├── global.css                  # Global styles
│       ├── variables.css               # CSS variables
│       ├── utilities.css               # Utility classes
│       └── responsive.css              # Responsive breakpoints
│
├── main.ts                             # Bootstrap file
├── index.html                          # HTML entry point
└── environment/
    ├── environment.ts                  # Development
    └── environment.prod.ts             # Production
```

## Architecture Layers

### 1. **Core Layer** (`core/`)
- **Singleton Services**: `AuthService`, `ApiService`, `ErrorService`
- **Route Guards**: Authentication, role-based authorization
- **Interceptors**: Token injection, error handling
- Only imported in `app.config.ts`, never in components directly

### 2. **Shared Layer** (`shared/`)
- **Reusable Components**: Data table, dialogs, alerts, layout components
- **Pipes & Directives**: Common utilities used across features
- **Models**: Shared DTOs and interfaces
- No business logic, purely presentational

### 3. **Feature Layer** (`features/`)
- **Auth Feature**: Login page and authentication logic
- **Warehouse Feature**: Manager-only warehouse management (CRUD, export)
- **Supply Document Feature**: Role-based document management
- **Dashboard**: Post-login welcome/summary page
- Each feature is independently lazy-loaded

## Key Design Patterns

### 1. **Authentication & Authorization**
```
User Login → AuthService.login() → Store JWT
Request → AuthInterceptor adds JWT → API call
Unauthorized (401) → Redirect to login
Forbidden (403) → Show error
Role-based guards prevent unauthorized navigation
```

### 2. **State Management with Signals**
```typescript
export const warehouseStore = (() => {
  const items = signal<Warehouse[]>([]);
  const loading = signal(false);
  const error = signal<string | null>(null);
  
  return {
    items: items.asReadonly(),
    loading: loading.asReadonly(),
    error: error.asReadonly(),
    loadWarehouses: () => { /* ... */ },
    deleteWarehouse: (id: number) => { /* ... */ },
  };
})();
```

### 3. **Service-Based API Layer**
Each feature has its own service handling API calls:
- `WarehouseService`: Warehouse CRUD, export
- `SupplyDocumentService`: Document CRUD, approval workflow
- `LoginService`: Authentication
- All services use `ApiService` wrapper for consistent error handling

### 4. **Route Guards for Role-Based Access**
```typescript
// warehouse routes - Manager only
path: 'warehouse',
canActivate: [roleGuard(['MANAGER'])]

// supply-document - Both users, different components
path: 'supply-documents',
canActivate: [authGuard]
```

### 5. **Component Communication**
- **Parent → Child**: Input properties using `input()` function
- **Child → Parent**: Output events using `output()` function
- **Sibling/Long-distance**: RxJS Subjects in services (sparingly)

## Routing Strategy

```typescript
// app.routes.ts
{
  path: '',
  component: AppLayoutComponent,
  canActivate: [authGuard],
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent
    },
    {
      path: 'warehouse',
      canActivate: [roleGuard(['MANAGER'])],
      loadChildren: () => import('./features/warehouse/warehouse.routes')
    },
    {
      path: 'supply-documents',
      loadChildren: () => import('./features/supply-document/supply-document.routes'),
      canActivate: [authGuard]
    }
  ]
},
{
  path: 'login',
  component: LoginComponent
}
```

## Data Flow Example: Add Warehouse

```
User Input (Form) 
  ↓
warehouse-add.component.ts (captures form data)
  ↓
WarehouseService.addWarehouse(dto) (API call)
  ↓
Backend API (stored procedure)
  ↓
ApiService (handles response/error)
  ↓
warehouseStore.update() (updates signal store)
  ↓
warehouse-list.component (re-renders via computed signals)
  ↓
User sees new warehouse in table
```

## Best Practices Applied

✅ **Standalone Components**: No NgModules  
✅ **Signals**: Modern state management  
✅ **Lazy Loading**: Feature routes loaded on demand  
✅ **OnPush Change Detection**: Better performance  
✅ **Typed Forms**: Reactive forms with FormBuilder  
✅ **Error Handling**: Centralized error service  
✅ **WCAG AA Compliance**: Accessible components  
✅ **Separation of Concerns**: Clear layer boundaries  
✅ **DRY Principle**: Reusable shared components  

## Implementation Checklist

- [ ] Setup environment variables (`environment.ts`)
- [ ] Create `ApiService` wrapper with HTTP interceptor
- [ ] Implement `AuthService` and role-based guards
- [ ] Create shared layout components (header, sidebar, footer)
- [ ] Create shared data-table component
- [ ] Build Auth Feature (login)
- [ ] Build Warehouse Feature (list, add, view, delete, export)
- [ ] Build Supply Document Feature (employee & manager views)
- [ ] Implement role-based routing
- [ ] Add global error handling
- [ ] Write unit tests (Vitest)
- [ ] Setup E2E testing (if needed)

## Development Commands

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode
npm run watch
```

---

This architecture provides scalability, maintainability, and follows Angular 21 best practices with signals and standalone components.
