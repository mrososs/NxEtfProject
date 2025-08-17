import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProfileService } from '../../features/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileGuard implements CanActivate {
  constructor(private profileService: ProfileService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if user is authenticated
    if (!this.profileService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      // Redirect to login or show login modal
      this.router.navigate(['/login']);
      return of(false);
    }

    // Check if user has a profile
    return this.profileService.hasProfile().pipe(
      map((hasProfile) => {
        if (!hasProfile) {
          console.log('User has no profile, redirecting to profile page');
          this.router.navigate(['/profile']);
          return false;
        }
        return true;
      }),
      catchError((error) => {
        console.error('Error checking profile:', error);
        // If there's an error, assume no profile and redirect
        this.router.navigate(['/profile']);
        return of(false);
      })
    );
  }
}
