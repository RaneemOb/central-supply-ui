import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Dashboard Component
 * Welcome page after login
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Welcome to Central Supply Unit</h1>
      
      <div class="welcome-message" *ngIf="currentUser">
        <p>Hello, <strong>{{ currentUser()?.userName }}</strong>!</p>
        <p>User Type: <strong>{{ currentUser()?.userType }}</strong></p>
      </div>

      <div class="features-grid">
        <div class="feature-card" *ngIf="isManager()">
          <h3>🏭 Warehouse Management</h3>
          <p>Manage warehouses and inventory items</p>
          <a routerLink="/warehouse" class="btn">Go to Warehouses</a>
        </div>

        <div class="feature-card">
          <h3>📋 Supply Documents</h3>
          <p>Create and manage supply documents</p>
          <a routerLink="/supply-documents" class="btn">Go to Documents</a>
        </div>
      </div>

      <div class="info-section">
        <h2>Quick Info</h2>
        <p>This is the dashboard. More features coming soon!</p>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .welcome-message {
        background: #ecf0f1;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3498db;
      }

      .welcome-message p {
        margin: 0.5rem 0;
        color: #2c3e50;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .feature-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s, box-shadow 0.3s;
      }

      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .feature-card h3 {
        color: #2c3e50;
        margin: 0 0 0.5rem 0;
      }

      .feature-card p {
        color: #7f8c8d;
        margin: 0 0 1rem 0;
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s;
      }

      .btn:hover {
        background: #2980b9;
      }

      .info-section {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #ecf0f1;
      }

      .info-section h2 {
        color: #2c3e50;
        margin-top: 0;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 1rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-dashboard-host',
  },
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;

  isManager(): boolean {
    return this.authService.hasRole('Manager' as any);
  }
}
