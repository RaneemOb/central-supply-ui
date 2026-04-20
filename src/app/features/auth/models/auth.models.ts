/**
 * Authentication Feature Models
 */

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  userFullName: string;
  userName: string;
  userType: 'MANAGER' | 'EMPLOYEE';
  token: string;
  expiresAt: Date;
}


