import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserSession {
  id: number;
  full_name: string;
  email: string;
  role: string;
  role_display_name: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSignal = signal<UserSession | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const raw = localStorage.getItem('hotelsjb_user');
    if (raw) {
      try {
        this.currentUserSignal.set(JSON.parse(raw));
      } catch {
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('hotelsjb_token');
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    return user.role === roleName;
  }

  login(email: string, pass: string) {
    return this.api.post<{ access_token: string; user: UserSession }>('auth/login', { email, pass }).pipe(
      tap((res) => {
        localStorage.setItem('hotelsjb_token', res.access_token);
        localStorage.setItem('hotelsjb_user', JSON.stringify(res.user));
        this.currentUserSignal.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('hotelsjb_token');
    localStorage.removeItem('hotelsjb_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
