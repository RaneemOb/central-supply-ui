# Central Supply Unit - Frontend Implementation Guide

## Project Setup ✅

### Prerequisites
- Node.js 18+ and npm 11+
- Angular CLI 21
- TypeScript 5.9

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:4200`

---

## Architecture Overview

This project uses a modern, scalable Angular 21 architecture with:

- **Standalone Components** - No NgModules
- **Signals** - Reactive state management
- **Feature-Based Organization** - Modular code structure
- **Lazy Loading** - Efficient route loading
- **TypeScript** - Strict typing throughout
- **Role-Based Access Control** - Manager & Employee views

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [x] Environment configuration
- [x] API Service with error handling
- [x] Authentication Service with Signals
- [x] Auth Guard & Role Guard
- [x] Auth Interceptor for JWT tokens
- [x] Error/Notification Service
- [x] Shared layout components (Header, Sidebar, Footer)
- [x] Error alert component
- [x] Feature Models and DTOs

### Phase 2: Authentication Feature (Next)
- [ ] **Login Component**
  - User name & password form
  - Client-side validation
  - Error handling
  - Redirect to dashboard on success
  
- [ ] **Login Service**
  - API call to backend
  - Token storage
  - User deserialization

**Files to create:**
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/login/login.component.html`
- `src/app/features/auth/login/login.component.css`
- `src/app/features/auth/services/login.service.ts`

### Phase 3: Warehouse Feature (Manager Only)
- [ ] **Warehouse Service**
  - Get all warehouses (stored procedure)
  - Add warehouse (stored procedure)
  - Delete warehouse (stored procedure)
  - Export to Excel
  
- [ ] **Warehouse List Component**
  - Data table with warehouse properties
  - View items button
  - Add warehouse button
  - Delete warehouse button
  - Export button
  
- [ ] **Warehouse Add Component**
  - Form for warehouse properties
  - Nested item grid for adding items
  - Submit to backend
  
- [ ] **Warehouse Detail Component**
  - Display warehouse and its items
  - Item details modal/view
  
- [ ] **Item Grid Component** (Nested in Add)
  - Add/Remove item rows
  - Item form validation

**Files to create:**
- `src/app/features/warehouse/services/warehouse.service.ts`
- `src/app/features/warehouse/warehouse-list/warehouse-list.component.*`
- `src/app/features/warehouse/warehouse-add/warehouse-add.component.*`
- `src/app/features/warehouse/warehouse-add/item-grid/item-grid.component.*`
- `src/app/features/warehouse/warehouse-detail/warehouse-detail.component.*`

### Phase 4: Supply Document Feature (All Users, Role-Based Views)
- [ ] **Supply Document Service**
  - Get documents by user type
  - Add supply document
  - Delete document
  - Approve/Reject document
  
- [ ] **Employee Document List**
  - Display user's documents
  - Add document button
  - Delete button
  
- [ ] **Manager Document List**
  - Display all employee documents
  - Approve button
  - Reject button
  
- [ ] **Add Supply Document**
  - Form for document properties
  - Warehouse dropdown
  - Item dropdown (filtered by warehouse)
  - Submit to backend
  
- [ ] **Warehouse Item Selector Component** (Nested)
  - Warehouse dropdown
  - Item dropdown (cascading)

**Files to create:**
- `src/app/features/supply-document/services/supply-document.service.ts`
- `src/app/features/supply-document/document-list/document-list.component.*`
- `src/app/features/supply-document/document-add/document-add.component.*`
- `src/app/features/supply-document/document-add/warehouse-item-selector/warehouse-item-selector.component.*`

### Phase 5: Dashboard Feature
- [ ] **Dashboard Component**
  - Welcome message
  - User statistics
  - Quick links
  - Recent activities (optional)

**Files to create:**
- `src/app/features/dashboard/dashboard.component.*`

### Phase 6: Shared Components & Utilities (As Needed)
- [ ] **Data Table Component**
  - Reusable grid for displaying data
  - Sorting, filtering, pagination
  - Action buttons (View, Edit, Delete)
  
- [ ] **Confirm Dialog**
  - Reusable confirmation dialog
  - Used before delete operations
  
- [ ] **Loading Spinner**
  - Show during async operations
  
- [ ] **Pipes & Directives**
  - Date formatting pipe
  - Other utility pipes as needed

---

## Development Workflow

### 1. Creating a New Feature Component

```bash
# Navigate to feature directory
cd src/app/features/your-feature

# Create component files manually or use Angular CLI:
ng generate component your-component --standalone --skip-tests
```

**Component template example:**
```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { YourService } from '../services/your.service';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `...`,
  styles: [`...`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourComponent {
  private readonly service = inject(YourService);
  
  // Your logic here
}
```

### 2. Creating a New Service

```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class YourService {
  private readonly api = inject(ApiService);

  getData() {
    return this.api.get('endpoint/path');
  }
}
```

### 3. Using Signals for State

```typescript
import { signal, computed } from '@angular/core';

const items = signal<Item[]>([]);
const loading = signal(false);
const error = signal<string | null>(null);

// Computed value (automatically updates)
const itemCount = computed(() => items().length);

// Update signal
items.set([...items(), newItem]);

// Or use update
items.update(current => [...current, newItem]);
```

### 4. Form Validation with Reactive Forms

```typescript
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

export class MyComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.valid) {
      const data = this.form.value;
      this.service.submit(data).subscribe(
        () => this.handleSuccess(),
        error => this.handleError(error)
      );
    }
  }
}
```

---

## API Integration

### Backend API Base URL
Update in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7071/api',
  // ... other settings
};
```

### Example API Call

```typescript
// In component
this.warehouseService.getWarehouses().subscribe(
  (data) => {
    this.warehouses.set(data);
    this.loading.set(false);
  },
  (error) => {
    this.error.set(error.message);
    this.errorService.showError(error.message);
  }
);

// In service
getWarehouses(): Observable<Warehouse[]> {
  return this.api.get<Warehouse[]>('warehouses');
}
```

---

## BestPractices

### ✅ Do's

- Use standalone components
- Use Signals for local state
- Keep components small and focused
- Use OnPush change detection
- Use typed forms (FormBuilder)
- Use lazy loading for features
- Add ARIA labels for accessibility
- Use service injection with `inject()`
- Use `@if`, `@for` instead of `*ngIf`, `*ngFor`
- Use RxJS operators properly (map, catchError, etc.)

### ❌ Don'ts

- Don't use NgModules (use standalone)
- Don't use `any` type
- Don't use template-driven forms
- Don't forget error handling
- Don't put business logic in components
- Don't mutate arrays/objects; create new ones
- Don't expose internal signals; use asReadonly()
- Don't forget to unsubscribe from observables

---

## Testing

### Unit Tests with Vitest

```bash
npm test
```

Create tests alongside your components:
```
my.component.ts
my.component.spec.ts
```

**Example test:**
```typescript
import { describe, it, expect } from 'vitest';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  it('should render', () => {
    // Test logic
  });
});
```

---

## Styling

### Global Styles
- `src/app/styles/global.css` - Base styles
- `src/app/styles/variables.css` - CSS variables
- `src/app/styles/utilities.css` - Utility classes
- `src/app/styles/responsive.css` - Responsive breakpoints

### Component Styles
Keep component styles inline or in separate `.css` files for organization.

```typescript
@Component({
  // ...
  styles: [`
    .container {
      display: flex;
      gap: 1rem;
    }
  `]
})
```

---

## Troubleshooting

### 401 Unauthorized
- Check if JWT token is stored correctly
- Verify token hasn't expired
- Check AuthInterceptor is properly registered

### 403 Forbidden
- User doesn't have required role
- Check role guard configuration
- Verify user's userType in backend

### CORS Issues
- Configure CORS on backend
- Check API URL in environment file
- Ensure credentials are included if needed

### Change Detection Issues
- Ensure all components have `OnPush` change detection
- Update signals properly (don't mutate)
- Use `computed()` for derived state

---

## Deployment

### Build for Production
```bash
npm run build
```

Output goes to `dist/central-supply-ui/`

### Environment Configuration
Update `src/environments/environment.prod.ts` with production API URL before building.

---

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular Best Practices](https://angular.dev/style-guide)
- [Signals Guide](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Support & Questions

For architecture-related questions, refer to [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Happy coding! 🚀**
