import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ProfileService } from '../../features/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private profileService: ProfileService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if user is authenticated
    const isAuthenticated = this.profileService.isAuthenticated();

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to error-500');
      this.router.navigate(['/error-500']);
      return of(false);
    }

    return of(true);
  }
}
