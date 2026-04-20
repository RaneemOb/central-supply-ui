import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/common.models';

/**
 * Role-Based Access Guard
 * Protects routes based on user role
 * Usage: canActivate: [roleGuard(['MANAGER'])]
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // User is authenticated but doesn't have required role
    console.warn('User does not have required role:', {
      userRole: authService.getCurrentUser()?.userType,
      requiredRoles: allowedRoles,
    });
    router.navigate(['/dashboard']); // Redirect to dashboard
    return false;
  };
};
