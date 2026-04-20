import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Warehouse Detail Component
 * Placeholder for viewing warehouse details and items
 */
@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warehouse-detail-container">
      <h2>Warehouse Details</h2>

      <div class="warehouse-info">
        <div class="info-section">
          <h3>Warehouse Information</h3>
          <div class="info-row">
            <label>Name:</label>
            <span>Sample Warehouse</span>
          </div>
          <div class="info-row">
            <label>Description:</label>
            <span>Sample warehouse description</span>
          </div>
          <div class="info-row">
            <label>Created By:</label>
            <span>Admin User</span>
          </div>
          <div class="info-row">
            <label>Created Date:</label>
            <span>2024-01-01</span>
          </div>
        </div>
      </div>

      <div class="items-section">
        <h3>Items in Warehouse</h3>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Description</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="3" class="no-items">
                No items in this warehouse yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .warehouse-detail-container {
        padding: 1.5rem;
        max-width: 900px;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
      }

      h3 {
        color: #34495e;
        margin: 1rem 0 0.75rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #ecf0f1;
      }

      .warehouse-info {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
      }

      .info-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .info-row {
        display: flex;
        padding: 0.75rem;
        border-bottom: 1px solid #ecf0f1;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-row label {
        font-weight: 600;
        min-width: 150px;
        color: #2c3e50;
      }

      .info-row span {
        color: #7f8c8d;
      }

      .items-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      .items-table th {
        background: #ecf0f1;
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid #bdc3c7;
      }

      .items-table td {
        padding: 0.75rem;
        border-bottom: 1px solid #ecf0f1;
      }

      .items-table tbody tr:hover {
        background: #f9f9f9;
      }

      .no-items {
        text-align: center;
        color: #95a5a6;
        font-style: italic;
        padding: 2rem !important;
      }

      @media (max-width: 768px) {
        .warehouse-detail-container {
          padding: 1rem;
        }

        .info-row {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-warehouse-detail-host',
  },
})
export class WarehouseDetailComponent {}
