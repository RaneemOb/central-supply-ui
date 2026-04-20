import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WarehouseService } from '../../../core/services/warehouse';
import { Warehouse, WarehouseItem } from '../../../features/warehouse/models/warehouse.models';
import { ErrorService } from '../../../core/services/error.service';
import { SupplyDocumentService } from '../services/supply-document.service';
import { CreateSupplyDocumentRequest } from '../models/supply-document.models';

/**
 * Supply Document Add Component
 * Placeholder for creating supply documents with warehouse/item selection
 */
@Component({
  selector: 'app-document-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="document-add-container">
      <h2>Create Supply Document</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="document-form">
        <div class="form-section">
          <h3>Document Information</h3>

          <div class="form-group">
            <label for="documentName">Document Name *</label>
            <input
              id="documentName"
              type="text"
              formControlName="documentName"
              placeholder="Enter document name"
            />
            <small class="error" *ngIf="isFieldInvalid('documentName')">
              Document name is required
            </small>
          </div>

          <div class="form-group">
            <label for="documentSubject">Subject *</label>
            <input
              id="documentSubject"
              type="text"
              formControlName="documentSubject"
              placeholder="Enter document subject"
            />
            <small class="error" *ngIf="isFieldInvalid('documentSubject')">
              Subject is required
            </small>
          </div>
        </div>

        <div class="form-section">
          <h3>Warehouse & Item Selection</h3>

          <div class="form-group">
            <label for="warehouse">Select Warehouse *</label>
            <select
              id="warehouse"
              formControlName="warehouseId"
              (change)="onWarehouseChange($event)"
              [disabled]="loading()"
            >
              <option value="">
                {{ loading() ? 'Loading warehouses...' : '-- Select Warehouse --' }}
              </option>
              <option *ngFor="let warehouse of warehouses()" [value]="warehouse.id">
                {{ warehouse.name }}
              </option>
            </select>
            <small class="error" *ngIf="isFieldInvalid('warehouseId')">
              Warehouse is required
            </small>
          </div>

          <div class="form-group">
            <label for="item">Select Item *</label>
            <select
              id="item"
              formControlName="itemId"
            >
              <option value="">-- Select Item --</option>
              <option *ngFor="let item of selectedWarehouseItems()" [value]="item.id">
                {{ item.name }} ({{ item.quantity }} available)
              </option>
            </select>
            <small class="error" *ngIf="isFieldInvalid('itemId')">
              Item is required
            </small>
          </div>

 
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting()">
            <span *ngIf="submitting()">Creating...</span>
            <span *ngIf="!submitting()">💾 Create Document</span>
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="submitting()"
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .document-add-container {
        padding: 1.5rem;
        max-width: 900px;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
      }

      h3 {
        color: #34495e;
        margin: 1rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #ecf0f1;
      }

      .form-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      input,
      select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        font-size: 0.95rem;
        font-family: inherit;
        box-sizing: border-box;
        transition: border-color 0.3s;
      }

      input:focus,
      select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
      }

      .error {
        display: block;
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 0.5rem;
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

      .btn-primary {
        background: #27ae60;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background: #229954;
      }

      .btn-primary:disabled {
        background: #95a5a6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;
      }

      .btn-secondary:hover {
        background: #7f8c8d;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      @media (max-width: 768px) {
        .form-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-document-add-host',
  },
})
export class DocumentAddComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly warehouseService = inject(WarehouseService);
  private readonly supplyDocumentService = inject(SupplyDocumentService);
  private readonly errorService = inject(ErrorService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly selectedWarehouseItems = signal<WarehouseItem[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.group({
    documentName: ['', [Validators.required, Validators.minLength(3)]],
    documentSubject: ['', [Validators.required, Validators.minLength(3)]],
    warehouseId: ['', Validators.required],
    itemId: ['', Validators.required],
   
  });

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading.set(true);
    this.warehouseService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses.set(warehouses);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading warehouses:', error);
        this.errorService.showError('Failed to load warehouses');
        this.loading.set(false);
      }
    });
  }

  onWarehouseChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const warehouseId = target.value;

    if (warehouseId) {
      const selectedWarehouse = this.warehouses().find(w => w.id.toString() === warehouseId);
      if (selectedWarehouse) {
        this.selectedWarehouseItems.set(selectedWarehouse.items || []);
        // Reset item selection when warehouse changes
        this.form.patchValue({ itemId: '' });
      }
    } else {
      this.selectedWarehouseItems.set([]);
      this.form.patchValue({ itemId: '' });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitting.set(true);
      
      const formData = this.form.value;
      const documentData: CreateSupplyDocumentRequest = {
        name: formData.documentName || '',
        subject: formData.documentSubject || '',
        warehouseId: parseInt(formData.warehouseId || '0'),
        itemId: parseInt(formData.itemId || '0'),
        
      };

      this.supplyDocumentService.createDocument(documentData).subscribe({
        next: (response) => {
          this.submitting.set(false);
          this.errorService.showSuccess('Supply document created successfully');
          this.router.navigate(['/supply-documents']);
        },
        error: (error) => {
          console.error('Error creating document:', error);
          this.submitting.set(false);
          this.errorService.showError('Failed to create supply document');
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/supply-documents']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
