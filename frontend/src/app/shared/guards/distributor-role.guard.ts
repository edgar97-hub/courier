import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AppStore } from '../../app.store'; // Adjust path as needed
import { UserRole } from '../../common/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class DistributorRoleGuard implements CanActivate {
  private appStore = inject(AppStore);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUser = this.appStore.currentUser();

    if (
      (currentUser && currentUser.role === UserRole.EMPRESA_DISTRIBUIDOR) ||
      (currentUser && currentUser.role === UserRole.ADMIN) ||
      (currentUser && currentUser.role === UserRole.RECEPTIONIST)
    ) {
      return true;
    } else {
      // Redirect to an unauthorized page or login page
      return this.router.createUrlTree(['/unauthorized']); // Assuming an unauthorized route exists
    }
  }
}
