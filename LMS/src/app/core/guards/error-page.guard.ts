import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ErrorStateService } from '../../shared/services/error-state.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorPageGuard implements CanActivate {
  constructor(
    private errorStateService: ErrorStateService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // If we're on error page, block all other navigation
    if (this.errorStateService.getCurrentErrorState()) {
      console.log('Navigation blocked: Currently on error page');
      // Redirect to error page if trying to access other pages
      this.router.navigate(['/error-500']);
      return of(false);
    }

    // If trying to access error-500 page, allow it
    if (state.url === '/error-500') {
      return of(true);
    }

    // For all other routes, check if we should block navigation
    if (this.errorStateService.shouldBlockNavigation()) {
      console.log('Navigation blocked: Error state active');
      this.router.navigate(['/error-500']);
      return of(false);
    }

    return of(true);
  }
}
