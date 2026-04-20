import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { WarehouseService } from '../../../core/services/warehouse';
import { ErrorService } from '../../../core/services/error.service';
import { CreateWarehouseRequest } from '../../../features/warehouse/models/warehouse.models';

/**
 * Warehouse Add Component
 * Add warehouse with multiple items
 */
@Component({
  selector: 'app-warehouse-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="warehouse-add-container">
      <h2>Add New Warehouse</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="warehouse-form">
        <div class="form-section">
          <h3>Warehouse Information</h3>

          <div class="form-group">
            <label for="warehouseName">Warehouse Name *</label>
            <input
              id="warehouseName"
              type="text"
              formControlName="warehouseName"
              placeholder="Enter warehouse name"
            />
            <small class="error" *ngIf="isFieldInvalid('warehouseName')">
              Warehouse name is required (3-100 characters)
            </small>
          </div>

          <div class="form-group">
            <label for="warehouseDescription">Description</label>
            <textarea
              id="warehouseDescription"
              formControlName="warehouseDescription"
              placeholder="Enter warehouse description"
              rows="4"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3>Items</h3>
          <p class="section-info">Add items to this warehouse</p>

          <div class="items-container" formArrayName="items">
            <div
              *ngFor="let item of items.controls; let i = index"
              [formGroupName]="i"
              class="item-row"
            >
              <div class="item-fields">
                <div class="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="Item name"
                  />
                  <small class="error" *ngIf="isItemFieldInvalid(i, 'name')">
                    Item name is required
                  </small>
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    formControlName="description"
                    placeholder="Item description"
                  />
                </div>

                <div class="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    formControlName="quantity"
                    placeholder="0"
                    min="1"
                  />
                  <small class="error" *ngIf="isItemFieldInvalid(i, 'quantity')">
                    Quantity must be at least 1
                  </small>
                </div>

                <div class="item-actions">
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    (click)="removeItem(i)"
                    [disabled]="items.length <= 1"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="add-item-section">
            <button type="button" class="btn btn-secondary" (click)="addItem()">
              ➕ Add Another Item
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Creating...' : '💾 Create Warehouse' }}
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
      .warehouse-add-container {
        padding: 1.5rem;
        max-width: 900px;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
      }

      h3 {
        color: #34495e;
        margin: 1.5rem 0 1rem 0;
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

      .section-info {
        color: #7f8c8d;
        font-size: 0.95rem;
        margin: 0 0 1rem 0;
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
      textarea {
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
      textarea:focus {
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

      .items-container {
        margin-bottom: 1rem;
      }

      .item-row {
        background: #f9f9f9;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #ecf0f1;
      }

      .item-fields {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr auto;
        gap: 1rem;
        align-items: start;
      }

      .item-actions {
        display: flex;
        align-items: flex-end;
        padding-bottom: 1.5rem;
      }

      .add-item-section {
        text-align: center;
        margin-top: 1rem;
      }

      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
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
    class: 'app-warehouse-add-host',
  },
})
export class WarehouseAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly warehouseService = inject(WarehouseService);
  private readonly errorService = inject(ErrorService);

  readonly submitting = signal(false);

  readonly form = this.fb.group({
    warehouseName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    warehouseDescription: [''],
    items: this.fb.array([
      this.createItemFormGroup() // Start with one item
    ], [Validators.minLength(1)])
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItemFormGroup() {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

onSubmit(): void {
  if (this.form.valid) {
    this.submitting.set(true);

    const formData = this.form.value;

    const warehouseData: CreateWarehouseRequest = {
      Name: formData.warehouseName || '',
      Description: formData.warehouseDescription || '',
      Items: (formData.items || []).map((item: any) => ({
        Name: item.name || '',
        Description: item.description || '',
        Quantity: item.quantity || 0
      }))
    };

    this.warehouseService.addWarehouse(warehouseData).subscribe({
      next: (response) => {
        this.submitting.set(false);

        const successMessage =
          response?.message || 'Warehouse created successfully!';

        alert(successMessage);

        this.router.navigate(['/warehouse']);
      },

      error: (error) => {
        this.submitting.set(false);

        const errorMessage =
          error?.error?.message ||
          error?.message ||
          'Failed to create warehouse. Please try again.';

        alert(errorMessage);
      }
    });

  } else {
    this.markFormGroupTouched(this.form);
  }
}
  onCancel(): void {
    this.router.navigate(['/warehouse']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isItemFieldInvalid(itemIndex: number, fieldName: string): boolean {
    const itemGroup = this.items.at(itemIndex) as any;
    const field = itemGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private markFormGroupTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach((group: any) => this.markFormGroupTouched(group));
      } else {
        control.markAsTouched();
      }
    });
  }
}
