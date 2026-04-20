# Backend Integration Guide

This guide explains how to integrate the Angular frontend with your ASP.NET Core backend API for the Central Supply Unit application.

---

## API Base Configuration

### Development Environment
Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7071/api',  // Update to your backend URL
  appName: 'Central Supply Unit',
  tokenKey: 'auth_token',
  userKey: 'current_user',
};
```

### Production Environment
Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',  // Production API URL
  appName: 'Central Supply Unit',
  tokenKey: 'auth_token',
  userKey: 'current_user',
};
```

---

## API Endpoints Expected from Backend

### 1. Authentication Module

#### POST `/api/auth/login`
**Request:**
```typescript
{
  userName: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    userId: number;
    userFullName: string;
    userName: string;
    userType: 'MANAGER' | 'EMPLOYEE';  // IMPORTANT: Must be exactly MANAGER or EMPLOYEE
    token: string;  // JWT token
    expiresAt: string; // ISO datetime string
  };
  errors: string[] | null;
}
```

**Example implementation:**
```typescript
// In login.service.ts
login(request: LoginRequest): Observable<LoginResponse> {
  return this.api.post<LoginResponse>('auth/login', request).pipe(
    tap(response => {
      this.authService.setUser({
        ...response.data,
        expiresAt: new Date(response.data.expiresAt),
      });
    })
  );
}
```

---

### 2. Warehouse Module (Manager Only)

#### GET `/api/warehouses`
Get all warehouses created by the logged-in manager (uses stored procedure).

**Query Parameters:**
- `pageNumber?: number` (default: 1)
- `pageSize?: number` (default: 10)
- `sortBy?: string` (field name)
- `sortDirection?: 'asc' | 'desc'`

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Warehouse[];
  errors: string[] | null;
}

// Warehouse data structure:
{
  warehouseId: number;
  warehouseName: string;
  warehouseDescription: string;
  createdBy: number;  // User ID (should match logged-in user)
  createdByName: string;
  createdDateTime: string; // ISO datetime
  items: [
    {
      itemId: number;
      itemName: string;
      itemDescription: string;
      quantity: number;
    }
  ];
}
```

---

#### POST `/api/warehouses`
Create a new warehouse with items (uses stored procedure).

**Request:**
```typescript
{
  warehouseName: string;  // Required, must be unique
  warehouseDescription: string; // Optional
  items: [
    {
      itemName: string;
      itemDescription: string;
      quantity: number;
    }
  ];
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: {
    warehouseId: number;
    warehouseName: string;
    // ... rest of warehouse data
  };
  errors: string[] | null;
}
```

**Frontend implementation:**
```typescript
// In warehouse.service.ts
createWarehouse(request: CreateWarehouseRequest): Observable<Warehouse> {
  return this.api.post<Warehouse>('warehouses', request);
}
```

---

#### DELETE `/api/warehouses/{id}`
Delete a warehouse and all its items (uses stored procedure).

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
  errors: string[] | null;
}
```

---

#### GET `/api/warehouses/{id}/export`
Export warehouse and items to Excel format.

**Response:** Excel file (binary data)

```typescript
// In warehouse.service.ts
exportWarehouse(id: number): Observable<Blob> {
  return this.api.get<Blob>(`warehouses/${id}/export`);
}

// In component:
downloadExcel(): void {
  this.warehouseService.exportWarehouse(this.warehouseId).subscribe(
    (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `warehouse-${this.warehouseId}.xlsx`;
      link.click();
    }
  );
}
```

---

### 3. Supply Document Module

#### GET `/api/supply-documents`
Get supply documents based on user role.

**For EMPLOYEE:** Returns documents created by this employee.
**For MANAGER:** Returns all documents created by any employee (for approval).

**Query Parameters:**
- `pageNumber?: number`
- `pageSize?: number`
- `status?: 'PENDING' | 'APPROVED' | 'REJECTED'`

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: SupplyDocument[];
  errors: string[] | null;
}

// SupplyDocument structure:
{
  documentId: number;
  documentName: string;
  documentSubject: string;
  createdBy: number;
  createdByName: string;
  createdDateTime: string;  // ISO datetime
  warehouseId: number;
  warehouseName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: number;
  approvedOrRejectedDate?: string; // ISO datetime
}
```

---

#### POST `/api/supply-documents`
Create a new supply document.

**Request:**
```typescript
{
  documentName: string;
  documentSubject: string;
  warehouseId: number;
  itemId: number;
  quantity: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: SupplyDocument;
  errors: string[] | null;
}
```

---

#### DELETE `/api/supply-documents/{id}`
Delete a supply document (only PENDING documents, only by creator or admin).

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: null;
  errors: string[] | null;
}
```

---

#### POST `/api/supply-documents/{id}/approve`
Approve a supply document (Manager only).

**Request:**
```typescript
{
  isApproved: boolean;  // true = approve, false = reject
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: SupplyDocument;  // Updated document with status
  errors: string[] | null;
}
```

---

## JWT Token Handling

### Token Format
The backend returns JWT tokens in the login response. The frontend automatically:

1. **Stores the token** in localStorage
2. **Injects it** into all API requests via the AuthInterceptor
3. **Handles expiration** by redirecting to login on 401 response

### Header Format
All API requests include the token:
```
Authorization: Bearer <jwt_token>
```

### Token Refresh
If your backend supports refresh tokens:

```typescript
// Add to auth.interceptor.ts
if (error.status === 401 && !request.url.includes('auth/refresh')) {
  // Attempt refresh
  return this.authService.refreshToken().pipe(
    switchMap(() => {
      // Retry original request with new token
      return next.handle(request);
    }),
    catchError(() => {
      this.authService.logout();
      return throwError(() => error);
    })
  );
}
```

---

## Error Handling Contract

### Backend Error Response Format
```typescript
{
  success: false;
  message: string;  // User-friendly error message
  data: null;
  errors: [
    "Field: Validation error message",
    "Another: Error message"
  ];
}
```

### Frontend Error Display
The `ErrorService` automatically displays errors:

```typescript
// Automatic handling in API calls:
this.api.post(endpoint, data).subscribe({
  next: (response) => {
    // Handle success
  },
  error: (error) => {
    // Error already logged in ApiService
    this.errorService.showError(error.message);
  }
});
```

---

## CORS Configuration

Your backend must allow requests from the frontend URL:

```csharp
// In Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:4200", "https://yourdomain.com")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Login Page                           │
│  User enters userName & password                        │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/auth/login
                     ▼
┌─────────────────────────────────────────────────────────┐
│           ASP.NET Core Backend API                      │
│  - Validate credentials                                 │
│  - Generate JWT token                                   │
│  - Return token + user data                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         AuthService & localStorage                      │
│  - Store token & user info                              │
│  - Set isAuthenticated = true                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         AuthGuard checks isAuthenticated                │
│  - If false: redirect to login                          │
│  - If true: allow access                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Dashboard / App Layout                          │
│  - Access protected features                            │
│  - AuthInterceptor adds token to headers                │
└─────────────────────────────────────────────────────────┘
```

---

## Validation Contract

### Client-Side (Frontend)
```typescript
// Warehouse name validation
warehouse name: [
  { type: 'required', message: 'Warehouse name is required' },
  { type: 'minlength', message: 'Minimum 3 characters' },
  { type: 'maxlength', message: 'Maximum 100 characters' },
  { type: 'pattern', message: 'Only letters, numbers, and spaces allowed' }
]
```

### Server-Side (Backend)
The backend must enforce the same validations and return errors with status 400.

---

## Testing API Integration

### Mock API (for development without backend)

```typescript
// Create src/app/core/services/mock-api.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockApiService {
  get<T>(endpoint: string): Observable<T> {
    // Return mock data based on endpoint
    if (endpoint.includes('warehouses')) {
      return of([
        {
          warehouseId: 1,
          warehouseName: 'Main Warehouse',
          // ... mock data
        }
      ] as any).pipe(delay(500));
    }
    return of({} as T);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return of(body as any).pipe(delay(500));
  }
}
```

### Use Mock Service
```typescript
// In app.config.ts (during development)
import { MockApiService } from './core/services/mock-api.service';

providers: [
  {
    provide: ApiService,
    useClass: MockApiService  // Replace during development
  }
]
```

---

## Troubleshooting API Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Check token in localStorage, verify expiration |
| 403 Forbidden | User lacks permission | Verify user role, check role-based routing |
| 404 Not Found | Wrong endpoint URL | Verify API endpoint matches backend route |
| 400 Bad Request | Invalid request data | Check form validation, inspect network tab |
| CORS Error | Frontend URL not allowed | Add frontend URL to CORS policy in backend |
| Token adding doesn't apply | Interceptor not properly configured | Verify HTTP_INTERCEPTORS in app.config.ts |

---

## API Service Methods Reference

```typescript
// All available in ApiService
this.api.get<T>(endpoint, params?)      // GET request
this.api.post<T>(endpoint, body)        // POST request
this.api.put<T>(endpoint, body)         // PUT request
this.api.patch<T>(endpoint, body)       // PATCH request
this.api.delete<T>(endpoint)            // DELETE request

// Example usage:
this.api.get<Warehouse[]>('warehouses?pageSize=10&pageNumber=1')
this.api.post<Warehouse>('warehouses', warehouseData)
this.api.delete<void>('warehouses/123')
```

---

## Summary

1. **Update API URL** in environment files
2. **Ensure backend** returns responses in expected format
3. **Configure CORS** on backend to allow frontend origin
4. **Test authentication flow** thoroughly
5. **Monitor network tab** in browser DevTools for API debugging
6. **Use mock service** during development if backend not ready

---

For more details on services and API integration, see [CODE_PATTERNS.md](./CODE_PATTERNS.md)
