import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Footer Component
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <p>&copy; 2024 Central Supply Unit. All rights reserved.</p>
    </footer>
  `,
  styles: [
    `
      .footer {
        background-color: #2c3e50;
        color: white;
        padding: 1.5rem;
        text-align: center;
        border-top: 1px solid #34495e;
      }

      .footer p {
        margin: 0;
        font-size: 0.9rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-footer-host',
  },
})
export class FooterComponent {}
