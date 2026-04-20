import { Injectable, signal } from '@angular/core';
import { NotificationMessage } from '../../shared/models/common.models';

/**
 * Error Service
 * Global error handling and notification
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly messagesSignal = signal<NotificationMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  /**
   * Show success notification
   */
  showSuccess(message: string, duration: number = 5000): void {
    this.addMessage({
      type: 'success',
      message,
      duration,
    });
  }

  /**
   * Show error notification
   */
  showError(message: string, duration: number = 5000): void {
    this.addMessage({
      type: 'error',
      message,
      duration,
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, duration: number = 5000): void {
    this.addMessage({
      type: 'warning',
      message,
      duration,
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string, duration: number = 5000): void {
    this.addMessage({
      type: 'info',
      message,
      duration,
    });
  }

  /**
   * Add notification message
   */
  private addMessage(notification: NotificationMessage): void {
    const messages = this.messagesSignal();
    this.messagesSignal.set([...messages, notification]);

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(
        () => this.removeMessage(notification),
        notification.duration
      );
    }
  }

  /**
   * Remove notification message
   */
  removeMessage(notification: NotificationMessage): void {
    const messages = this.messagesSignal().filter(m => m !== notification);
    this.messagesSignal.set(messages);
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messagesSignal.set([]);
  }
}
