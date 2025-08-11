import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { ErrorStateService } from '../../shared/services/error-state.service';

export interface UserProfile {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  description?: string;
  imageUrl?: string;
  imageLink?: string;
  userId?: number;
  courses?: any[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private readonly PROFILE_ENDPOINT =
    'http://etfapi.itechpro-eg.com/api/profile/me';
  private hasRedirectedToError = false;

  // Cache for profile data
  private profileCache$: Observable<UserProfile | null> | null = null;
  private refreshProfileSubject = new BehaviorSubject<void>(undefined);

  constructor(private errorStateService: ErrorStateService) {}

  /**
   * Get user profile from API with caching
   * Uses shareReplay to cache the response and avoid multiple API calls
   */
  getProfile(): Observable<UserProfile | null> {
    // Skip API call if we're on error page
    if (this.errorStateService.shouldSkipApiCalls()) {
      return of(null);
    }

    // If cache exists, return cached response
    if (this.profileCache$) {
      return this.profileCache$;
    }

    // Create new cache with shareReplay
    this.profileCache$ = this.refreshProfileSubject.pipe(
      switchMap(() => this.fetchProfileFromAPI()),
      shareReplay(1) // Cache the last emitted value and share it with all subscribers
    );

    return this.profileCache$;
  }

  /**
   * Fetch profile from API (private method for actual HTTP call)
   */
  private fetchProfileFromAPI(): Observable<UserProfile | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .get<UserProfile>(`${this.PROFILE_ENDPOINT}`, {
        headers,
      })
      .pipe(
        map((response) => {
          const profile = response as UserProfile;

          // Save user's name to localStorage for homepage display
          if (profile.firstName && profile.lastName) {
            const fullName = `${profile.firstName} ${profile.lastName}`.trim();
            localStorage.setItem('userFullName', fullName);
            localStorage.setItem('userFirstName', profile.firstName);
            localStorage.setItem('userLastName', profile.lastName);
            console.log('User name saved to localStorage:', fullName);
          }

          return profile;
        }),
        catchError((error) => {
          // Handle 302 redirect - user needs to create profile
          if (error.status === 302) {
            console.log(
              'Profile not found - redirecting to profile creation page'
            );
            this.redirectToProfilePage();
            return of(null);
          }

          // Handle 404 - no profile created
          if (error.status === 404) {
            console.log(
              'No profile created - redirecting to profile creation page'
            );
            this.redirectToProfilePage();
            return of(null);
          }

          // Handle authentication errors (401, 403, 500)
          if (
            error.status === 401 ||
            error.status === 403 ||
            error.status === 500
          ) {
            console.log('Authentication error - redirecting to error page');
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          // For any other error, redirect to main site
          console.log('Unknown error - redirecting to main site');
          this.redirectToMainSite();
          return throwError(() => error);
        })
      );
  }

  /**
   * Create or Update user profile
   */
  postProfile(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      // Don't set Content-Type for FormData, let browser set it with boundary
    });

    return this.http
      .post<any>(`${this.PROFILE_ENDPOINT}`, formData, {
        headers,
      })
      .pipe(
        map((response) => {
          // Clear cache after successful profile update
          this.clearProfileCache();
          return response;
        }),
        catchError((error) => {
          // Handle authentication errors
          if (
            error.status === 401 ||
            error.status === 403 ||
            error.status === 500
          ) {
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          // For other errors, redirect to main site
          this.redirectToMainSite();
          return throwError(() => error);
        })
      );
  }

  /**
   * Clear profile cache to force fresh API call
   */
  clearProfileCache(): void {
    this.profileCache$ = null;
    this.refreshProfileSubject.next();
    console.log('Profile cache cleared');
  }

  /**
   * Refresh profile data (clears cache and fetches fresh data)
   */
  refreshProfile(): Observable<UserProfile | null> {
    this.clearProfileCache();
    return this.getProfile();
  }

  /**
   * Check authentication on app startup
   * This is the main method called when application starts
   */
  checkAuthenticationOnStartup(): Observable<boolean> {
    // Skip authentication check if we're on error page
    if (this.errorStateService.shouldSkipApiCalls()) {
      return of(false);
    }

    return this.getProfile().pipe(
      map((profile) => {
        // If profile exists, user is authenticated
        return profile !== null;
      }),
      catchError((error) => {
        // All error handling is done in getProfile method
        return of(false);
      })
    );
  }

  /**
   * Check if user has a profile
   */
  hasProfile(): Observable<boolean> {
    return this.getProfile().pipe(
      map((profile) => {
        return profile !== null;
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }

  /**
   * Redirect to profile page
   */
  private redirectToProfilePage(): void {
    window.location.href = '/profile';
  }

  /**
   * Redirect to main site
   */
  private redirectToMainSite(): void {
    window.location.href = 'http://etf.itechpro-eg.com/';
  }

  /**
   * Show authentication error page
   */
  private showAuthErrorPage(): void {
    // Prevent infinite redirects
    if (
      this.hasRedirectedToError ||
      this.errorStateService.getCurrentErrorState()
    ) {
      return;
    }

    this.hasRedirectedToError = true;
    this.errorStateService.setErrorState(true);

    // Navigate to the error-500 page
    window.location.href = '/error-500';
  }

  /**
   * Clear authentication data on logout
   */
  logout(): void {
    // Clear profile cache
    this.clearProfileCache();

    // Clear localStorage authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user_id');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');

    // Clear cookies with proper expiration and path
    const cookieOptions = '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
