import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 * Protects routes that require user to be authenticated
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login (check if sessionStorage is available)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('redirectUrl', state.url);
  }
  router.navigate(['/login']);
  return false;
};
