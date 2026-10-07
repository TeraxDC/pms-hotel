import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const module = route.data?.['module'];
  if (!module) {
    return true;
  }

  if (auth.canAccess(module)) {
    return true;
  }

  toast.warning('Acceso restringido: Su rol no cuenta con permisos para acceder a esta sección.');
  router.navigate([auth.getDefaultRoute()]);
  return false;
};
