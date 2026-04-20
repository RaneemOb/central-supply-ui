import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';

/**
 * Authentication Interceptor
 * Adds JWT token to all outgoing HTTP requests
 * Handles 401 (Unauthorized) responses
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('AuthInterceptor: Intercepting request to:', request.url);
    // Add JWT token to request header if available
    const token = this.authService.getToken();
    console.log('AuthInterceptor: Token available:', !!token);
    if (token && !this.authService.isTokenExpired()) {
      console.log('AuthInterceptor: Adding token to request:', request.url);
      console.log('AuthInterceptor: Token length:', token.length);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('AuthInterceptor: Headers after adding token:', request.headers.get('Authorization'));
    } else {
      console.log('AuthInterceptor: No valid token available for request:', request.url, 'Expired:', this.authService.isTokenExpired());
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token expired or invalid
          this.authService.logout();
          this.errorService.showError('Session expired. Please login again.');
        } else if (error.status === 403) {
          // Forbidden - user doesn't have permission
          this.errorService.showError('You do not have permission to access this resource.');
          this.router.navigate(['/dashboard']);
        }

        return throwError(() => error);
      })
    );
  }
}
