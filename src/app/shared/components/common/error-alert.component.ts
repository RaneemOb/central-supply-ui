import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../core/services/error.service';

/**
 * Global Error/Notification Component
 * Displays all notifications from the ErrorService
 */
@Component({
  selector: 'app-error-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications" *ngIf="messages().length > 0">
      <div
        class="notification"
        [class]="'notification-' + msg.type"
        *ngFor="let msg of messages(); trackBy: trackByMessage"
      >
        <span class="notification-icon"> {{ getIcon(msg.type) }} </span>
        <span class="notification-message">{{ msg.message }}</span>
        <button
          class="notification-close"
          (click)="removeMessage(msg)"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      }

      .notification {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      }

      .notification-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .notification-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .notification-warning {
        background-color: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
      }

      .notification-info {
        background-color: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }

      .notification-icon {
        font-size: 1.2rem;
        min-width: 20px;
      }

      .notification-message {
        flex: 1;
        font-size: 0.95rem;
      }

      .notification-close {
        background: none;
        border: none;
        color: currentColor;
        cursor: pointer;
        font-size: 1rem;
        padding: 0;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .notification-close:hover {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 600px) {
        .notifications {
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-error-alert-host',
  },
})
export class ErrorAlertComponent {
  private readonly errorService = inject(ErrorService);

  readonly messages = this.errorService.messages;

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ',
    };
    return icons[type] || '•';
  }

  removeMessage(msg: any): void {
    this.errorService.removeMessage(msg);
  }

  trackByMessage(index: number, msg: any): any {
    return msg;
  }
}
