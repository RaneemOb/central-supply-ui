/**
 * Common DTOs and Interfaces used across the application
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  details: string | null;
}

export enum UserRole {
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee',
}

export interface User {
  userId: number;
  userName: string;
  userType: UserRole;
}

export interface CurrentUser extends User {
  token: string;
  expiresAt: Date;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  width?: string;
  sortable?: boolean;
  formatter?: (value: any) => string;
}

export interface TableState {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  okButtonText?: string;
  cancelButtonText?: string;
}

export interface NotificationMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
