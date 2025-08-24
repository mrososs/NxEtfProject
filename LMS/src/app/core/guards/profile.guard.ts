import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, of, tap } from 'rxjs';

export const profileGuard = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  console.log('🔒 Profile Guard: Checking if user has profile...');

  // Make a direct API call to check profile, bypassing ProfileService complexity
  return http
    .get('api/profile/me', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      observe: 'response',
    })
    .pipe(
      tap((response) => {
        console.log('🔒 Profile Guard: API response status:', response.status);
      }),
      map((response) => {
        // Check if response is HTML instead of JSON (redirect)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          console.log(
            '❌ Profile Guard: API returned HTML - likely redirect, no profile'
          );
          router.navigate(['/profile'], { replaceUrl: true });
          return false;
        }

        // If we get a valid JSON response, user has a profile
        const profile = response.body;
        if (profile && profile.firstName && profile.lastName) {
          console.log('✅ Profile Guard: Access granted - user has profile');
          return true;
        }

        // If response exists but no valid profile data
        console.log('❌ Profile Guard: No valid profile data found');
        router.navigate(['/profile'], { replaceUrl: true });
        return false;
      }),
      catchError((error) => {
        console.error('❌ Profile Guard: Error checking profile:', error);

        // Handle different error statuses
        if (error.status === 404 || error.status === 302) {
          console.log(
            '🔄 Profile Guard: No profile found (404/302) - redirecting to profile page'
          );
          router.navigate(['/profile'], { replaceUrl: true });
          return of(false);
        }

        if (error.status === 500) {
          console.log(
            '🔄 Profile Guard: Server error (500) - redirecting to profile page'
          );
          router.navigate(['/profile'], { replaceUrl: true });
          return of(false);
        }

        // For any other error, also redirect to profile page
        console.log(
          '🔄 Profile Guard: Unknown error - redirecting to profile page'
        );
        router.navigate(['/profile'], { replaceUrl: true });
        return of(false);
      })
    );
};
