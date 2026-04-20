import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorService } from '../../../core/services/error.service';
import { LoginRequest } from '../models/auth.models';
import { LoginService } from '../services/login.service';

/**
 * Login Component
 * Placeholder for login UI implementation
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Central Supply Unit</h1>
        <h2>Login</h2>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="userName">Username:</label>
            <input
              id="userName"
              type="text"
              formControlName="userName"
              placeholder="Enter your username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .login-box {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
      }

      h1 {
        text-align: center;
        color: #2c3e50;
        margin: 0 0 0.5rem 0;
        font-size: 1.8rem;
      }

      h2 {
        text-align: center;
        color: #7f8c8d;
        margin: 0 0 1.5rem 0;
        font-size: 1.2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2c3e50;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #bdc3c7;
        border-radius: 4px;
        font-size: 1rem;
        box-sizing: border-box;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      button {
        width: 100%;
        padding: 0.75rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      button:hover:not(:disabled) {
        background: #764ba2;
      }

      button:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .login-box {
          margin: 1rem;
          padding: 1.5rem;
        }

        h1 {
          font-size: 1.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-login-host',
  },
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);
 private readonly loginService = inject(LoginService);
  readonly submitting = signal(false);

  readonly form = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorService.showError('Please fill in all fields correctly');
      return;
    }

    this.submitting.set(true);

    this.loginService.login(this.form.value as LoginRequest).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorService.showError(err.message || 'Login failed');
      },
    });
  }
}
