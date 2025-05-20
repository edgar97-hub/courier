import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export function redirectLoginIfNotAuthenticated(): CanMatchFn {
  return async () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
      return true;
    } else {
      return router.parseUrl('/login');
    }
  };
}

export function redirectDashboardIfAuthenticated(): CanMatchFn {
  return () => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (authService.isAuthenticated()) {
      return router.parseUrl('/dashboard');
    } else {
      return true;
    }
  };
}
