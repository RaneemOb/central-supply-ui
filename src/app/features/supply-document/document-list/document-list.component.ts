import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupplyDocumentService } from '../services/supply-document.service';
import { SupplyDocumentDto } from '../models/supply-document.models';
import { ErrorService } from '../../../core/services/error.service';

/**
 * Supply Document List Component
 * Placeholder for document listing (Employee & Manager views)
 */
@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="document-list-container">
      <h2>Supply Documents</h2>

      <div class="user-info">
        <p>
          View:
          <strong>{{ currentUser()?.userType === 'Manager' ? 'All Employees Documents' : 'My Documents' }}</strong>
        </p>
      </div>

      <div *ngIf="currentUser()?.userType === 'Employee'" class="controls">
        <button routerLink="/supply-documents/add" class="btn btn-primary">
          ➕ Add Document
        </button>

      </div>

      <div class="table-container">
        <div *ngIf="loading()" class="loading">
          Loading documents...
        </div>
        <table *ngIf="!loading()" class="data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Subject</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Status</th>
              <th *ngIf="currentUser()?.userType === 'Manager'">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let document of documents()">
              <td>{{ document.name }}</td>
              <td>{{ document.subject || '-' }}</td>
              <td>{{ document.createdByName }}</td>
              <td>{{ document.createdDate | date:'short' }}</td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(document.statusName)">
                  {{ document.statusName }}
                </span>
              </td>
              <td *ngIf="currentUser()?.userType === 'Manager'">
                <div class="action-buttons" *ngIf="document.statusName === 'Pending'">
                  <button
                    class="btn btn-success btn-sm"
                    (click)="approveDocument(document.id)"
                    [disabled]="processingDocument() === document.id">
                    ✓ Accept
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    (click)="rejectDocument(document.id)"
                    [disabled]="processingDocument() === document.id"
                  >
                    ✗ Reject
                  </button>
                </div>
              
              </td>
            </tr>
            <tr *ngIf="documents().length === 0">
              <td [colSpan]="isManager() ? 6 : 5" class="no-data">
                No supply documents found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .document-list-container {
        padding: 1.5rem;
      }

      h2 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .user-info {
        background: #ecf0f1;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        border-left: 4px solid #3498db;
      }

      .user-info p {
        margin: 0;
        color: #2c3e50;
      }

      .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
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

      .btn:disabled {
        opacity: 0.6;
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

      .data-table th {
        padding: 1rem;
        text-align: left;
        font-weight: 600;
      }

      .data-table td {
        padding: 1rem;
        border-bottom: 1px solid #ecf0f1;
      }

      .data-table tbody tr:hover {
        background: #f9f9f9;
      }

      .no-data {
        text-align: center;
        color: #7f8c8d;
        font-style: italic;
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-badge.pending {
        background: #f39c12;
        color: white;
      }

      .status-badge.approved {
        background: #27ae60;
        color: white;
      }

      .status-badge.rejected {
        background: #e74c3c;
        color: white;
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .btn-success {
        background: #27ae60;
        color: white;
      }

      .btn-success:hover:not(:disabled) {
        background: #229954;
      }

      .status-text {
        color: #7f8c8d;
        font-style: italic;
      }

      .loading {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .controls {
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
    class: 'app-document-list-host',
  },
})
export class DocumentListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly supplyDocumentService = inject(SupplyDocumentService);
  private readonly errorService = inject(ErrorService);

  readonly currentUser = this.authService.currentUser;
  readonly documents = signal<SupplyDocumentDto[]>([]);
  readonly loading = signal(false);
  readonly processingDocument = signal<number | null>(null);

  ngOnInit(): void {
    this.loadDocuments();
  }

  isManager(): boolean {
    return this.authService.hasRole('Manager' as any);
  }

  getStatusClass(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return '';
    }
  }

  loadDocuments(): void {
    this.loading.set(true);
    
    const documentObservable = this.isManager() 
      ? this.supplyDocumentService.getAllDocuments()
      : this.supplyDocumentService.getMyDocuments();

    documentObservable.subscribe({
      next: (documents) => {
        this.documents.set(documents);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.errorService.showError('Failed to load documents');
        this.loading.set(false);
      }
    });
  }

  approveDocument(documentId: number): void {
    this.processingDocument.set(documentId);

    this.supplyDocumentService.approveDocument(documentId).subscribe({
      next: (response) => {
        this.processingDocument.set(null);
        this.errorService.showSuccess('Document approved successfully');
        this.loadDocuments(); // Reload the list to show updated status
      },
      error: (error) => {
        console.error('Error approving document:', error);
        this.processingDocument.set(null);
        this.errorService.showError('Failed to approve document');
      }
    });
  }

  rejectDocument(documentId: number): void {
    this.processingDocument.set(documentId);

    this.supplyDocumentService.rejectDocument(documentId).subscribe({
      next: (response) => {
        this.processingDocument.set(null);
        this.errorService.showSuccess('Document rejected successfully');
        this.loadDocuments(); // Reload the list to show updated status
      },
      error: (error) => {
        console.error('Error rejecting document:', error);
        this.processingDocument.set(null);
        this.errorService.showError('Failed to reject document');
      }
    });
  }
}
