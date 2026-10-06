import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const setupGuard: CanActivateFn = (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.get<{ isConfigured: boolean }>('onboarding/status').pipe(
    map((res) => {
      const isSetupRoute = state.url.startsWith('/setup');

      if (!res.isConfigured) {
        // El sistema requiere configuración inicial
        if (!isSetupRoute) {
          router.navigate(['/setup']);
          return false;
        }
        return true;
      } else {
        // El sistema ya fue configurado
        if (isSetupRoute) {
          router.navigate(['/']);
          return false;
        }
        return true;
      }
    }),
    catchError(() => {
      // Si la API aún no está disponible o error de red, permitir navegación
      return of(true);
    })
  );
};
