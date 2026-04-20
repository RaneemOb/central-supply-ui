import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/common.models';
import { AuthService } from './auth.service';

/**
 * API Service - Wrapper around HttpClient
 * Handles all HTTP requests with consistent error handling and configuration
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;
  private readonly requestTimeout = 30000; // 30 seconds

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('API Service getAuthHeaders - Token available:', !!token);
    if (token && !this.authService.isTokenExpired()) {
      console.log('API Service - Adding Authorization header');
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.log('API Service - No valid token, headers empty');
    }

    return headers;
  }

  /**
   * GET request
   */
  get<T>(
    endpoint: string,
    params?: HttpParams | { [key: string]: string | string[] }
  ): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, { headers, params })
      .pipe(timeout(this.requestTimeout), catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    console.log('API Service POST:', `${this.baseUrl}/${endpoint}`);
    console.log('Request body:', body);
    console.log('Request headers:', headers.keys());
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe(timeout(this.requestTimeout), catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe(timeout(this.requestTimeout), catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, body?: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.request<T>('DELETE', `${this.baseUrl}/${endpoint}`, {
      headers,
      body
    }).pipe(timeout(this.requestTimeout), catchError(this.handleError));
  }

  /**
   * DELETE request with text response
   */
  deleteText(endpoint: string, body?: any): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.request('DELETE', `${this.baseUrl}/${endpoint}`, {
      headers,
      body,
      responseType: 'text'
    }).pipe(timeout(this.requestTimeout), catchError(this.handleTextError));
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, { headers })
      .pipe(timeout(this.requestTimeout), catchError(this.handleError));
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error - try different ways to extract the message
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.Message) {
        errorMessage = error.error.Message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }
    }

    console.error('HttpError:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
      statusText: error.statusText,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      statusText: error.statusText,
      error: error.error,
    }));
  }

  /**
   * Error handling for text responses
   */
  private handleTextError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error - for text responses, the error might be in the response body
      if (typeof error.error === 'string' && error.error.trim()) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Text HttpError:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
      statusText: error.statusText,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      statusText: error.statusText,
      error: error.error,
    }));
  }
}
