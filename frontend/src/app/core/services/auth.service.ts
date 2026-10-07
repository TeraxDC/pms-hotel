import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

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

  hasRole(roles: string | string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;
    const perms = user.permissions || [];
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  }

  canAccess(module: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.role === 'SUPERADMIN') return true;

    switch (module) {
      case 'rack':
        return ['SUPERADMIN', 'ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);
      case 'rooms':
        return ['SUPERADMIN', 'ADMIN', 'RECEPTIONIST'].includes(user.role);
      case 'reservations':
        return ['SUPERADMIN', 'ADMIN', 'RECEPTIONIST'].includes(user.role);
      case 'cash':
        return ['SUPERADMIN', 'ADMIN', 'RECEPTIONIST'].includes(user.role);
      case 'housekeeping':
        return ['SUPERADMIN', 'ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'].includes(user.role);
      case 'reports':
        return ['SUPERADMIN', 'ADMIN'].includes(user.role);
      case 'users':
        return ['SUPERADMIN', 'ADMIN'].includes(user.role);
      case 'statuses':
        return ['SUPERADMIN'].includes(user.role);
      case 'cms':
        return ['SUPERADMIN', 'ADMIN'].includes(user.role);
      default:
        return false;
    }
  }

  getDefaultRoute(): string {
    const user = this.currentUser();
    if (!user) return '/login';
    if (user.role === 'HOUSEKEEPING') return '/pms/housekeeping';
    return '/pms/rack';
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
