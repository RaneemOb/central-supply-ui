import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, UserRole } from '../../shared/models/common.models';

/**
 * Authentication Service
 * Manages user authentication state and JWT token
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  // State management with signals
  private readonly currentUserSignal = signal<CurrentUser | null>(
    this.loadUserFromStorage()
  );
  private readonly isAuthenticatedSignal = computed(
    () => this.currentUserSignal() !== null
  );

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal;

  // BehaviorSubject for legacy observables (if needed)
  private readonly authStateSubject = new BehaviorSubject<boolean>(
    this.isAuthenticatedSignal()
  );
  readonly authState$ = this.authStateSubject.asObservable();

  constructor() {
    // Subscribe to signal changes to update BehaviorSubject
    this.isAuthenticated;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.userType);
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSignal();
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    const user = this.currentUserSignal();
    const token = user?.token || null;
    console.log('AuthService: Getting token:', !!token);
    return token;
  }

  /**
   * Set user (called after login)
   */
  setUser(user: CurrentUser): void {
    console.log('AuthService: Setting user:', user);
    this.currentUserSignal.set(user);
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    localStorage.setItem(environment.tokenKey, user.token);
    this.authStateSubject.next(true);
  }

  /**
   * Clear user (called on logout)
   */
  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(environment.userKey);
    localStorage.removeItem(environment.tokenKey);
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const user = this.currentUserSignal();
    if (!user?.expiresAt) return true;

    const expirationTime = new Date(user.expiresAt).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= expirationTime;
  }

  /**
   * Load user from localStorage (for page refresh scenario)
   */
  private loadUserFromStorage(): CurrentUser | null {
    try {
      // Check if localStorage is available (for SSR compatibility)
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const userJson = localStorage.getItem(environment.userKey);
      if (!userJson) return null;

      const user: CurrentUser = JSON.parse(userJson);

      // Check if token is not expired
      if (!this.isTokenExpiredAt(user.expiresAt)) {
        return user;
      }

      // Token expired, clear storage
      localStorage.removeItem(environment.userKey);
      localStorage.removeItem(environment.tokenKey);
      return null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      // Try to clear storage if available
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(environment.userKey);
        localStorage.removeItem(environment.tokenKey);
      }
      return null;
    }
  }

  /**
   * Check if specific token expiration time is reached
   */
  private isTokenExpiredAt(expiresAt: Date): boolean {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    return currentTime >= expirationTime;
  }
}
