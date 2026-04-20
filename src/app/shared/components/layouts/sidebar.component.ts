import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../models/common.models';

/**
 * Sidebar Navigation Component
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.open]="isOpen()">
      <nav class="navigation">
        <ul class="nav-menu">
          <li class="nav-item">
            <a routerLink="/dashboard" (click)="closeSidebar.emit()" routerLinkActive="active">
              📊 Dashboard
            </a>
          </li>

          <li class="nav-item" *ngIf="isManager()">
            <a routerLink="/warehouse" (click)="closeSidebar.emit()" routerLinkActive="active">
              🏭 Warehouse
            </a>
          </li>

          <li class="nav-item">
            <a routerLink="/supply-documents" (click)="closeSidebar.emit()" routerLinkActive="active">
              📋 Supply Documents
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: 250px;
        background-color: #34495e;
        color: white;
        padding: 1rem 0;
        overflow-y: auto;
        transition: width 0.3s ease;
        height: 100%;
      }

      .navigation {
        height: 100%;
      }

      .nav-menu {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-item a {
        display: block;
        padding: 1rem 1.5rem;
        color: white;
        text-decoration: none;
        transition: background-color 0.2s;
        border-left: 3px solid transparent;
      }

      .nav-item a:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-item a.active {
        background-color: #2c3e50;
        border-left-color: #3498db;
      }

      @media (max-width: 768px) {
        .sidebar {
          position: fixed;
          left: -250px;
          top: 60px;
          height: calc(100vh - 60px);
          z-index: 1000;
          transition: left 0.3s ease;
        }

        .sidebar.open {
          left: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-sidebar-host',
  },
})
export class SidebarComponent {
  readonly isOpen = input(true);
  readonly closeSidebar = output<void>();
  private readonly authService = inject(AuthService);

  isManager(): boolean {
    return this.authService.hasRole(UserRole.MANAGER);
  }
}
