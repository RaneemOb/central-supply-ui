import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrentUser, UserRole } from '../../../shared/models/common.models';
import { LoginRequest, LoginResponse } from '../models/auth.models';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  login(request: LoginRequest): Observable<CurrentUser> {
    return this.api.post<LoginResponse>('auth/login', request).pipe(
      map((response) => {
        console.log('LoginService: Login response:', response);
        const user = this.mapResponseToCurrentUser(response);
        console.log('LoginService: Mapped user:', user);
        this.authService.setUser(user);

        return user;
      })
    );
  }

  private mapResponseToCurrentUser(response: LoginResponse): CurrentUser {
    const payload: any = jwtDecode(response.token);
    console.log('LoginService: JWT payload:', payload);

    return {
      userId: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      userName: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      userType: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as UserRole,
      token: response.token,
      expiresAt: new Date(response.expiresAt),
    };
  }


}
