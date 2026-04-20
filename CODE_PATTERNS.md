# Code Patterns & Examples

Quick reference for common patterns used in this Central Supply Unit project.

## 1. Component with Signals and Service

```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { MyService } from '../services/my.service';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>My Items ({{ itemCount() }})</h2>
      
      <div *ngIf="loading()">Loading...</div>
      
      <div *ngIf="error()">{{ error() }}</div>
      
      <ul *ngIf="!loading() && items().length > 0">
        <li *ngFor="let item of items()">
          {{ item.name }}
        </li>
      </ul>
      
      <p *ngIf="!loading() && items().length === 0">No items found.</p>
    </div>
  `,
  styles: ['...'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyListComponent {
  private readonly service = inject(MyService);

  // State management with signals
  readonly items = signal<Item[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed value - updates automatically
  readonly itemCount = computed(() => this.items().length);

  constructor() {
    this.loadItems();
  }

  private loadItems(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getItems().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

## 2. Service with API Calls

```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Item {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class MyService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'items';

  getItems(): Observable<Item[]> {
    return this.api.get<Item[]>(this.endpoint);
  }

  getItemById(id: number): Observable<Item> {
    return this.api.get<Item>(`${this.endpoint}/${id}`);
  }

  createItem(item: Item): Observable<Item> {
    return this.api.post<Item>(this.endpoint, item);
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this.api.put<Item>(`${this.endpoint}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
```

## 3. Form Component with Validation

```typescript
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { signal } from '@angular/core';
import { MyService } from '../services/my.service';

@Component({
  selector: 'app-my-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          id="name"
          type="text"
          formControlName="name"
          placeholder="Enter name"
        />
        <div *ngIf="isFieldInvalid('name')" class="error">
          <small *ngIf="form.get('name')?.hasError('required')">Name is required</small>
          <small *ngIf="form.get('name')?.hasError('minlength')">Minimum 3 characters</small>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea
          id="description"
          formControlName="description"
          placeholder="Enter description"
          rows="3"
        ></textarea>
      </div>

      <button type="submit" [disabled]="submitting() || form.invalid">
        {{ submitting() ? 'Submitting...' : 'Submit' }}
      </button>
    </form>

    <div *ngIf="successMessage()" class="success">
      {{ successMessage() }}
    </div>

    <div *ngIf="errorMessage()" class="error">
      {{ errorMessage() }}
    </div>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      input,
      textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .error {
        color: #e74c3c;
        margin-top: 0.5rem;
      }
      .success {
        color: #27ae60;
        padding: 1rem;
        background: #ecf0f1;
        border-radius: 4px;
        margin-top: 1rem;
      }
      button {
        padding: 0.5rem 1rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyFormComponent {
  private readonly service = inject(MyService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.service.createItem(this.form.value).subscribe({
      next: (data) => {
        this.submitting.set(false);
        this.successMessage.set('Item created successfully!');
        this.form.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
```

## 4. Cascading Dropdowns (Warehouse → Items)

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { WarehouseService } from '../../warehouse/services/warehouse.service';
import { Warehouse, WarehouseItem } from '../../warehouse/models/warehouse.models';

@Component({
  selector: 'app-warehouse-item-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="selector">
      <div class="form-group">
        <label for="warehouse">Warehouse:</label>
        <select
          id="warehouse"
          [(ngModel)]="selectedWarehouseId"
          (change)="onWarehouseChange()"
          [disabled]="loadingWarehouses()"
        >
          <option value="">-- Select Warehouse --</option>
          <option *ngFor="let w of warehouses()" [value]="w.warehouseId">
            {{ w.warehouseName }}
          </option>
        </select>
      </div>

      <div class="form-group" *ngIf="selectedWarehouseId">
        <label for="item">Item:</label>
        <select
          id="item"
          [(ngModel)]="selectedItemId"
          [disabled="loadingItems() || availableItems().length === 0"
        >
          <option value="">-- Select Item --</option>
          <option *ngFor="let item of availableItems()" [value]="item.itemId">
            {{ item.itemName }} (Qty: {{ item.quantity }})
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseItemSelectorComponent {
  private readonly warehouseService = inject(WarehouseService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly loadingWarehouses = signal(false);
  readonly loadingItems = signal(false);

  selectedWarehouseId = '';
  selectedItemId = '';

  // Computed: items from selected warehouse
  readonly availableItems = computed(() => {
    const warehouse = this.warehouses().find(
      w => w.warehouseId === Number(this.selectedWarehouseId)
    );
    return warehouse?.items ?? [];
  });

  constructor() {
    this.loadWarehouses();
  }

  private loadWarehouses(): void {
    this.loadingWarehouses.set(true);
    this.warehouseService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses.set(data);
        this.loadingWarehouses.set(false);
      },
      error: () => {
        this.loadingWarehouses.set(false);
      },
    });
  }

  onWarehouseChange(): void {
    // Reset item selection when warehouse changes
    this.selectedItemId = '';
    this.loadingItems.set(false);
  }
}
```

## 5. Data Table Component with Actions

```typescript
import { Component, input, ChangeDetectionStrategy, input as ComponentInput } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../../shared/models/common.models';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th *ngFor="let column of columns()">
              {{ column.header }}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data()">
            <td *ngFor="let column of columns()">
              {{ formatCellValue(row, column) }}
            </td>
            <td class="actions">
              <button class="btn-view" (click)="onView(row)">View</button>
              <button class="btn-edit" (click)="onEdit(row)">Edit</button>
              <button class="btn-delete" (click)="onDelete(row)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .table-container {
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        background: #2c3e50;
        color: white;
        padding: 1rem;
        text-align: left;
      }
      td {
        border-bottom: 1px solid #ddd;
        padding: 1rem;
      }
      tr:hover {
        background: #f5f5f5;
      }
      .actions {
        white-space: nowrap;
      }
      button {
        margin-right: 0.5rem;
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .btn-view {
        background: #3498db;
        color: white;
      }
      .btn-edit {
        background: #f39c12;
        color: white;
      }
      .btn-delete {
        background: #e74c3c;
        color: white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T> {
  readonly data = input<T[]>([]);
  readonly columns = input<TableColumn<T>[]>([]);

  formatCellValue(row: T, column: TableColumn<T>): string {
    const value = row[column.key];
    return column.formatter
      ? column.formatter(value)
      : String(value ?? '');
  }

  onView(row: T): void {
    console.log('View:', row);
  }

  onEdit(row: T): void {
    console.log('Edit:', row);
  }

  onDelete(row: T): void {
    console.log('Delete:', row);
  }
}
```

## 6. Guard Pattern

```typescript
// Use in routes:
{
  path: 'warehouse',
  canActivate: [roleGuard([UserRole.MANAGER])],
  // ... route config
}

// In component:
if (this.authService.hasRole(UserRole.MANAGER)) {
  // Show manager features
}
else if (this.authService.hasRole(UserRole.EMPLOYEE)) {
  // Show employee features
}
```

## 7. Error Handling Pattern

```typescript
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';

export class MyComponent {
  private readonly errorService = inject(ErrorService);

  doSomething(): void {
    this.service.fetchData().subscribe({
      next: (data) => {
        this.errorService.showSuccess('Data loaded successfully!');
        // Process data
      },
      error: (error) => {
        this.errorService.showError(
          error.message || 'An error occurred'
        );
      },
    });
  }
}
```

## 8. Reusable Pattern Store (Signals)

```typescript
import { signal, computed } from '@angular/core';
import { Injectable } from '@angular/core';

// Create a store pattern using signals
export const createWarehouseStore = () => {
  const items = signal<Warehouse[]>([]);
  const selectedId = signal<number | null>(null);
  const loading = signal(false);

  const selectedWarehouse = computed(() => {
    const id = selectedId();
    return id ? items().find(w => w.id === id) : null;
  });

  return {
    items: items.asReadonly(),
    selectedId: selectedId.asReadonly(),
    loading: loading.asReadonly(),
    selectedWarehouse,

    setItems: (ware: Warehouse[]) => items.set(ware),
    selectWarehouse: (id: number) => selectedId.set(id),
    addWarehouse: (w: Warehouse) =>
      items.update(current => [...current, w]),
    removeWarehouse: (id: number) =>
      items.update(current => current.filter(w => w.id !== id)),
  };
};

// Usage in service
@Injectable({ providedIn: 'root' })
export class WarehouseStore {
  private readonly store = createWarehouseStore();

  // Expose store API
  readonly items = this.store.items;
  readonly selectedWarehouse = this.store.selectedWarehouse;

  select(id: number) {
    this.store.selectWarehouse(id);
  }
}
```

---

These patterns follow Angular 21 best practices and are used throughout the Central Supply Unit project.
