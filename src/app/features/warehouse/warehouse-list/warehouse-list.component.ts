import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Warehouse, WarehouseItem } from '../models/warehouse.models';
import { WarehouseService } from '../../../core/services/warehouse';
import { ErrorService } from '../../../core/services/error.service';

/**
 * Warehouse List Component
 * Displays list of warehouses with their items
 */
@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="warehouse-list-container">
      <h2>Warehouse Management</h2>
      
      <div class="instructions" *ngIf="warehouses().length > 0">
        <p>💡 <strong>To delete warehouses:</strong> Check the boxes next to the warehouses you want to delete, then click "Delete Selected".</p>
      </div>

      <div class="controls">
        <div class="selection-info" *ngIf="selectedWarehouses().length > 0">
          <span class="selection-count">{{ selectedWarehouses().length }} warehouse(s) selected</span>
          <button class="btn btn-link" (click)="clearSelection()">Clear selection</button>
        </div>
        
        <div class="action-buttons">
          <button routerLink="/warehouse/add" class="btn btn-primary">
            ➕ Add Warehouse
          </button>
          <button 
            class="btn btn-danger" 
            [disabled]="selectedWarehouses().length === 0 || deleting()"
            (click)="deleteSelectedWarehouses()">
            🗑️ Delete Selected ({{ selectedWarehouses().length }})
          </button>
          <button class="btn btn-secondary" [disabled]="true">
            📥 Export to Excel
          </button>
        </div>
      </div>

      <div class="table-container" *ngIf="!loading()">
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center;">
                <input 
                  type="checkbox" 
                  [checked]="isAllSelected()" 
                  [indeterminate]="isPartiallySelected()"
                  (change)="toggleSelectAll()"
                  title="Select/Deselect All Warehouses">
                <br>
                <small style="font-size: 0.7rem; opacity: 0.8;">Select All</small>
              </th>
              <th>Warehouse Name</th>
              <th>Description</th>
              <th>Created By</th>
              <th>Created Date</th>           

            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let warehouse of warehouses(); trackBy: trackByWarehouseId">
              <!-- Warehouse Row -->
              <tr class="warehouse-row" 
                  [class.expanded]="isExpanded(warehouse)" 
                  [class.selected]="isSelected(warehouse.id)"
                  (click)="toggleExpanded(warehouse)">
                <td (click)="$event.stopPropagation()" style="text-align: center;">
                  <input 
                    type="checkbox" 
                    [checked]="isSelected(warehouse.id)"
                    (change)="toggleWarehouseSelection(warehouse.id)"
                    title="Select this warehouse for deletion">
                </td>
                <td>
                  <span class="expand-icon">{{ isExpanded(warehouse) ? '▼' : '▶' }}</span>
                  <span *ngIf="isSelected(warehouse.id)" class="selected-indicator">✓</span>
                  {{ warehouse.name }}
                </td>
                <td>{{ warehouse.description }}</td>
                <td>{{ warehouse.createdByName }}</td>
                <td>{{ warehouse.createdDate | date:'short' }}</td>
                

              </tr>
              <!-- Expanded Items Section -->
              <tr *ngIf="isExpanded(warehouse)" class="items-row">
                <td colspan="6">
                  <div class="items-section">
                    <h4>Warehouse Items</h4>
                    <div class="items-grid" *ngIf="warehouse.items.length > 0; else noItems">
                      <div class="item-card" *ngFor="let item of warehouse.items; trackBy: trackByItemId">
                        <div class="item-header">
                          <h5>{{ item.name }}</h5>
                          <span class="item-quantity">Qty: {{ item.quantity }}</span>
                        </div>
                        <p class="item-description">{{ item.description || 'No description' }}</p>
                      </div>
                    </div>
                    <ng-template #noItems>
                      <p class="no-items">No items in this warehouse</p>
                    </ng-template>
                  </div>
                </td>
              </tr>
            </ng-container>
            <tr *ngIf="warehouses().length === 0">
              <td colspan="6" class="no-data">
                No warehouses created yet. Click "Add Warehouse" to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="loading()" class="loading">
        Loading warehouses...
      </div>
    </div>
  `,
  styles: [
    `
      .warehouse-list-container {
        padding: 1.5rem;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
      }

      .instructions {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .instructions p {
        margin: 0;
        color: #856404;
      }

      .controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .selection-info {
        background: #e8f4f8;
        border: 1px solid #3498db;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .selection-count {
        font-weight: 600;
        color: #2c3e50;
      }

      .btn-link {
        background: none;
        border: none;
        color: #3498db;
        cursor: pointer;
        text-decoration: underline;
        font-size: 0.9rem;
        padding: 0;
      }

      .btn-link:hover {
        color: #2980b9;
      }

      .action-buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s;
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        margin-right: 0.5rem;
      }

      .btn-primary {
        background: #3498db;
        color: white;
      }

      .btn-primary:hover {
        background: #2980b9;
      }

      .btn-danger {
        background: #e74c3c;
        color: white;
      }

      .btn-danger:hover:not(:disabled) {
        background: #c0392b;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #7f8c8d;
      }

      .btn-edit {
        background: #f39c12;
        color: white;
      }

      .btn-edit:hover:not(:disabled) {
        background: #e67e22;
      }

      .btn-danger:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }

      .table-container {
        overflow-x: auto;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table thead {
        background: #2c3e50;
        color: white;
      }

      .data-table th:first-child,
      .data-table td:first-child {
        width: 50px;
        text-align: center;
        padding: 0.5rem;
      }

      .data-table th:first-child input[type="checkbox"],
      .data-table td:first-child input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin: 0;
        cursor: pointer;
        accent-color: #e74c3c;
        border: 2px solid #ddd;
        border-radius: 3px;
      }

      .data-table th:first-child input[type="checkbox"]:checked,
      .data-table td:first-child input[type="checkbox"]:checked {
        background-color: #e74c3c;
        border-color: #e74c3c;
      }

      .data-table th:first-child {
        background: #34495e;
        color: white;
      }

      .data-table td {
        padding: 1rem;
        border-bottom: 1px solid #ecf0f1;
      }

      .warehouse-row.selected {
        background: #d4edda !important;
        border-left: 4px solid #27ae60;
      }

      .warehouse-row.selected:hover {
        background: #c3e6cb !important;
      }

      .warehouse-row:hover {
        background: #e9ecef;
      }

      .warehouse-row.expanded {
        background: #e3f2fd;
      }

      .expand-icon {
        margin-right: 0.5rem;
        font-weight: bold;
        color: #3498db;
      }

      .selected-indicator {
        color: #e74c3c;
        font-weight: bold;
        margin-left: 0.5rem;
        font-size: 1.1em;
      }

      .items-count {
        font-weight: normal;
        color: #27ae60;
      }

      .items-row {
        background: #ffffff;
      }

      .items-section {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        margin: 0.5rem 0;
      }

      .items-section h4 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
        font-size: 1.1rem;
      }

      .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }

      .item-card {
        background: white;
        padding: 1rem;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 3px solid #3498db;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .item-header h5 {
        margin: 0;
        color: #2c3e50;
        font-size: 1rem;
      }

      .item-quantity {
        background: #27ae60;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .item-description {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .no-items {
        text-align: center;
        color: #95a5a6;
        font-style: italic;
        padding: 1rem;
      }

      .no-data {
        text-align: center;
        color: #7f8c8d;
        font-style: italic;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
      }

      @media (max-width: 768px) {
        .controls {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }

        .item-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-warehouse-list-host',
  },
})
export class WarehouseListComponent implements OnInit {
  private readonly warehouseService = inject(WarehouseService);
  private readonly errorService = inject(ErrorService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly loading = signal(true);
  readonly deleting = signal(false);
  readonly expandedWarehouses = signal<Set<number>>(new Set());
  readonly selectedWarehouses = signal<number[]>([]);

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private loadWarehouses(): void {
    this.loading.set(true);
    this.warehouseService.getMyWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses.set(warehouses);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorService.showError('Failed to load warehouses');
        this.loading.set(false);
      },
    });
  }

  isExpanded(warehouse: Warehouse): boolean {
    return this.expandedWarehouses().has(warehouse.id);
  }

  toggleExpanded(warehouse: Warehouse): void {
    const current = this.expandedWarehouses();
    const newSet = new Set(current);
    if (newSet.has(warehouse.id)) {
      newSet.delete(warehouse.id);
    } else {
      newSet.add(warehouse.id);
    }
    this.expandedWarehouses.set(newSet);
  }

  trackByWarehouseId(index: number, warehouse: Warehouse): number {
    return warehouse.id;
  }

  trackByItemId(index: number, item: WarehouseItem): number {
    return item.id;
  }

  clearSelection(): void {
    this.selectedWarehouses.set([]);
  }

  isSelected(warehouseId: number): boolean {
    return this.selectedWarehouses().includes(warehouseId);
  }

  toggleWarehouseSelection(warehouseId: number): void {
    console.log('Toggling selection for warehouse:', warehouseId);
    const current = this.selectedWarehouses();
    if (current.includes(warehouseId)) {
      this.selectedWarehouses.set(current.filter(id => id !== warehouseId));
    } else {
      this.selectedWarehouses.set([...current, warehouseId]);
    }
    console.log('Selected warehouses:', this.selectedWarehouses());
  }

  isAllSelected(): boolean {
    return this.warehouses().length > 0 && this.selectedWarehouses().length === this.warehouses().length;
  }

  isPartiallySelected(): boolean {
    const selectedCount = this.selectedWarehouses().length;
    const totalCount = this.warehouses().length;
    return selectedCount > 0 && selectedCount < totalCount;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedWarehouses.set([]);
    } else {
      this.selectedWarehouses.set(this.warehouses().map(w => w.id));
    }
  }

  deleteSelectedWarehouses(): void {
    if (this.selectedWarehouses().length === 0) return;

    if (!confirm(`Are you sure you want to delete ${this.selectedWarehouses().length} warehouse(s)? This action cannot be undone.`)) {
      return;
    }

    this.deleting.set(true);
    this.warehouseService.deleteWarehouses(this.selectedWarehouses()).subscribe({
      next: (result: string) => {
        this.deleting.set(false);
        // Show success alert
        alert(`: ${result || 'Warehouses deleted successfully'}`);
        this.selectedWarehouses.set([]);
        this.loadWarehouses(); // Reload the list
      },
      error: (error) => {
        this.deleting.set(false);
        console.error('Delete error:', error);
        
        // The backend returns plain text error messages
        const errorMessage = error.message || 'Unknown error occurred';
        
        if (error.status === 404) {
          // Backend returns NotFound with the error message
          alert(`❌ Cannot Delete: ${errorMessage}`);
        } else {
          alert(`❌ Error: ${errorMessage}`);
        }
      }
    });
  }
}
