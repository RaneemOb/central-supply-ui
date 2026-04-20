# Central Supply Unit - Frontend Quick Start

## 📋 Project Overview

This is a modern Angular 21 frontend for the Central Supply Unit system, built with:
- **Standalone Components** (no NgModules)
- **Signals** (reactive state management)
- **Role-Based Access Control** (Manager & Employee)
- **Feature-Based Architecture** (modular, scalable)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Update API Configuration
Edit `src/environments/environment.ts` and set your backend URL:
```typescript
apiUrl: 'https://localhost:7071/api'  // Change to your backend URL
```

### 3. Start Development Server
```bash
npm start
```
Navigate to `http://localhost:4200`

### 4. Login
Use credentials from your backend database:
- Username: test_manager
- Password: password123

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete architecture overview & structure |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Step-by-step implementation checklist |
| [CODE_PATTERNS.md](./CODE_PATTERNS.md) | Reusable code patterns & examples |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | API integration guide & endpoints |

→ **Start with ARCHITECTURE.md to understand the project structure**

---

## 📁 Folder Structure at a Glance

```
src/app/
├── core/                    # Authentication, guards, interceptors
│   ├── services/           # AuthService, ApiService, ErrorService
│   ├── guards/             # authGuard, roleGuard
│   └── interceptors/       # AutohInterceptor
│
├── shared/                  # Reusable components & utilities
│   ├── components/         # Layout, common UI components
│   ├── models/             # DTOs & interfaces
│   └── pipes/              # Custom pipes
│
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/               # Login page
│   ├── warehouse/          # Warehouse management (Manager only)
│   ├── supply-document/    # Document management
│   └── dashboard/          # Post-login dashboard
│
├── app.routes.ts           # Main routing
├── app.config.ts           # App configuration
└── app.ts                  # Root component
```

---

## 🔐 Authentication Flow

```
1. User enters credentials → Login Component
2. Credentials sent → Backend API
3. JWT Token received → Stored in localStorage
4. Token added to all requests → AuthInterceptor
5. Access granted → AppLayout + protected routes
```

**Login credentials format:**
```
Username: string
Password: string
```

---

## 🛠️ Core Services (Already Implemented)

### AuthService
```typescript
// Check if user is authenticated
authService.isAuthenticated()  // Reactive signal

// Get current user
authService.currentUser()  // Reactive signal

// Check if user has specific role
authService.hasRole(UserRole.MANAGER)  // Boolean

// Logout user
authService.logout()  // Clears data & redirects to login
```

### ApiService
```typescript
// All API calls use this service
api.get<T>(endpoint, params?)
api.post<T>(endpoint, body)
api.put<T>(endpoint, body)
api.delete<T>(endpoint)
```

### ErrorService
```typescript
// Show notifications
errorService.showSuccess('Message')
errorService.showError('Message')
errorService.showWarning('Message')
```

---

## 📝 Next Steps - What to Build

### Phase 1: Login & Auth ✅
- [x] Core authentication infrastructure
- [ ] Login Component (build this first)
- [ ] Login Service

### Phase 2: Warehouse Module (Manager) 🏭
- [ ] Warehouse Service
- [ ] Warehouse List (view all, add, delete)
- [ ] Add Warehouse with Items
- [ ] Export to Excel

### Phase 3: Supply Documents 📋
- [ ] Supply Document Service
- [ ] Employee Document List
- [ ] Manager Document Approval
- [ ] Add Document with Warehouse/Item selector

### Phase 4: Dashboard 📊
- [ ] Summary page
- [ ] Quick stats

---

## 🎯 Building Your First Feature - Login Component

### 1. Create Component Files
```bash
# In src/app/features/auth/login/
# Create these 3 files:
- login.component.ts      # Component logic
- login.component.html    # Template
- login.component.css     # Styles
```

### 2. Basic Component Structure
```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `...`, // Your HTML
  styles: [`...`], // Your CSS
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  private readonly errorService = inject(ErrorService);

  form = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.loginService.login(this.form.value).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.errorService.showError(err.message),
      });
    }
  }
}
```

### 3. Create Login Service
```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = inject(ApiService);
  
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', credentials);
  }
}
```

---

## ✅ Rules & Best Practices

### ✅ DO
- Use standalone components
- Use Signals for local state
- Use OnPush change detection
- Use lazy loading for features
- Keep components small & focused
- Use typed forms (FormBuilder)
- Handle errors in API calls
- Add ARIA labels for a11y

### ❌ DON'T
- Don't use NgModules
- Don't use `any` type
- Don't mutate objects/arrays
- Don't forget to unsubscribe
- Don't put business logic in components
- Don't use template-driven forms
- Don't publish internal signals (use asReadonly())

---

## 🐛 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Cannot read property 'userType'" | User not logged in, check AuthService.isAuthenticated() |
| "API returning 401" | Token expired or invalid, check localStorage |
| "404 Not Found" | Wrong API endpoint, verify in BACKEND_INTEGRATION.md |
| "CORS Error" | Backend CORS not configured, add frontend URL |
| "Components not re-rendering" | Check if using OnPush without signals |
| "Form not submitting" | Verify form.valid is true before submit |

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              App Component                          │
│          (app.ts - Root)                           │
└────────────────┬────────────────────────────────────┘
                 │
        app.routes.ts (Router Config)
         ├─ /login → LoginComponent
         └─ / (protected) → AppLayoutComponent
            ├─ /dashboard → DashboardComponent
            ├─ /warehouse → WarehouseListComponent (Manager only)
            └─ /supply-documents → DocumentListComponent
                 │
                 ├─ AuthGuard: Check if authenticated
                 └─ RoleGuard: Check user role
                 
                 │
    ┌────────────┴─────────────┐
    │                          │
 Core:                    Shared:
 • AuthService          • Layout components
 • ApiService          • Data table
 • ErrorService        • Error alert
 • Guards              • Pipes
 • Interceptors        • Common DTOs
```

---

## 💾 State Management (Signals)

```typescript
// Create signals for component state
const items = signal<Item[]>([]);
const loading = signal(false);
const error = signal<string | null>(null);

// Update values
items.set([...items(), newItem]);  // Set new value
loading.set(true);

// Derived state (auto-updates)
const itemCount = computed(() => items().length);

// Read in template
<p>Count: {{ itemCount() }}</p>
```

---

## 🔗 API Integration Quick Reference

```typescript
// In environment.ts
apiUrl: 'https://localhost:7071/api'

// API calls are wrapped
// → Request includes JWT token automatically
// → Errors are caught and logged
// → Responses are typed

// Example:
this.api.post<LoginResponse>('auth/login', credentials)
  .subscribe(
    response => { /* success */ },
    error => { /* error */ }
  );
```

---

## 📦 Build & Deploy

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
# Output: dist/central-supply-ui/
```

### Deploy
1. Build for production
2. Copy `dist/central-supply-ui/` to your web server
3. Update API URL in `environment.prod.ts` before building
4. Ensure backend CORS allows your frontend domain

---

## 📞 Support Resources

- **Angular Docs**: https://angular.dev
- **TypeScript Docs**: https://www.typescriptlang.org
- **RxJS Docs**: https://rxjs.dev

---

## 📋 Checklist Before Deployment

- [ ] Update API URL in environment files
- [ ] All features implemented (Auth, Warehouse, Supply Documents)
- [ ] Tests written and passing
- [ ] Backend CORS configured
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Accessibility checks (AXE)
- [ ] Performance optimized (lazy loading, OnPush)
- [ ] Security: No secrets in code

---

## 🎓 Learning Path

1. **Start**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Understand**: Study folder structure & role of each service
3. **Implement**: Build Login Component following CODE_PATTERNS.md
4. **Integrate**: Connect to backend using BACKEND_INTEGRATION.md
5. **Extend**: Build remaining features using patterns

---

## 📝 File Reference

| File | Status | Purpose |
|------|--------|---------|
| `app.config.ts` | ✅ Ready | App configuration |
| `app.routes.ts` | ✅ Ready | Routing setup |
| Core services | ✅ Ready | Auth, API, Error handling |
| Shared components | ✅ Ready | Layout, Error alert |
| Login feature | 🔲 To build | Authentication UI |
| Warehouse feature | 🔲 To build | Manager warehouse management |
| Supply Document feature | 🔲 To build | Document management |
| Dashboard | 🔲 To build | Post-login summary |

---

**Happy coding! Start with the Login component and follow CODE_PATTERNS.md for reference.** 🚀
