import { Component, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Header Component
 * Navigation and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()">
          <span class="hamburger-menu">☰</span>
        </button>
        <h1 class="app-title">Central Supply Unit</h1>
      </div>
      <div class="header-right">
        <span class="user-name" *ngIf="currentUser">
          {{ currentUser()?.userName }}
        </span>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #2c3e50;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header-left,
      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .menu-toggle {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
      }

      .app-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
      }

      .user-name {
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .logout-btn {
        padding: 0.5rem 1rem;
        background-color: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
      }

      .logout-btn:hover {
        background-color: #c0392b;
      }

      @media (max-width: 768px) {
        .header {
          padding: 0.5rem 1rem;
        }

        .app-title {
          font-size: 1.1rem;
        }

        .user-name {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-header-host',
  },
})
export class HeaderComponent {
  readonly toggleSidebar = output<void>();
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}
