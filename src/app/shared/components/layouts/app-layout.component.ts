import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from './footer.component';

/**
 * Main Application Layout Component
 * Provides header, sidebar, and footer for authenticated pages
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  template: `
    <div class="app-container">
      <app-header (toggleSidebar)="toggleSidebar()"></app-header>
      <div class="main-content">
        <app-sidebar
          [isOpen]="sidebarOpen()"
          (closeSidebar)="closeSidebar()"
        ></app-sidebar>
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .main-content {
        display: flex;
        flex: 1;
      }

      .content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      @media (max-width: 768px) {
        .app-container {
          height: auto;
        }

        .content {
          padding: 10px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-layout-host',
  },
})
export class AppLayoutComponent {
  readonly sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
