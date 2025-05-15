import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function redirectLoginIfNotAuthenticated(): CanMatchFn {
  return async (route) => {
    const router = inject(Router);

    const user = await inject(AuthService).getAuthState();

    if (!user) {
      return router.parseUrl('/login');
    }

    return true;
  };
}

export function redirectDashboardIfAuthenticated(): CanMatchFn {
  return async (route) => {
    const router = inject(Router);

    const user = await inject(AuthService).getAuthState();
    if (!user) {
      return true;
    }

    return router.parseUrl('/orders');
  };
}
