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
  private readonly PROFILE_ENDPOINT = 'api/profile/me';
  private hasRedirectedToError = false;
  private hasRedirectedToProfile = false; // Track if we've redirected to profile page
  private redirectToProfileTimestamp = 0; // Track when we redirected to profile

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

    // Check if we have a session storage flag indicating 500 error occurred
    const has500Error = sessionStorage.getItem('profile_500_error');
    if (has500Error === 'true') {
      console.log(
        'Skipping getProfile API call due to previous 500 error - waiting for user to create profile'
      );
      return of(null);
    }

    // Prevent infinite loop: if we recently redirected to profile page due to 500 error,
    // don't call the API again for a short period
    if (this.hasRedirectedToProfile && this.isRecentlyRedirected()) {
      console.log('Skipping getProfile API call to prevent infinite loop');
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
   * Check if we recently redirected to profile page (within last 30 seconds)
   */
  private isRecentlyRedirected(): boolean {
    const now = Date.now();
    const timeSinceRedirect = now - this.redirectToProfileTimestamp;
    return timeSinceRedirect < 30000; // 30 seconds
  }

  /**
   * Reset redirect flags when user successfully creates/updates profile
   */
  resetRedirectFlags(): void {
    this.hasRedirectedToProfile = false;
    this.redirectToProfileTimestamp = 0;
    this.clear500ErrorFlag();
    console.log('Redirect flags reset - API calls will work normally again');
  }

  /**
   * Clear 500 error flag from session storage
   */
  private clear500ErrorFlag(): void {
    sessionStorage.removeItem('profile_500_error');
    console.log('500 error flag cleared - API calls will work normally again');
  }

  /**
   * Manually clear 500 error flag (for testing/debugging)
   */
  public clear500ErrorFlagManually(): void {
    this.clear500ErrorFlag();
  }

  /**
   * Check if we're currently preventing API calls due to recent redirect
   */
  isInRedirectPreventionMode(): boolean {
    return this.hasRedirectedToProfile && this.isRecentlyRedirected();
  }

  /**
   * Check if we're currently preventing API calls due to 500 error
   */
  isIn500ErrorMode(): boolean {
    return sessionStorage.getItem('profile_500_error') === 'true';
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
        observe: 'response', // Get full response to check content type
      })
      .pipe(
        map((response) => {
          // Check if response is HTML instead of JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.error(
              'API returned HTML instead of JSON. This usually means a redirect to login page.'
            );
            throw new Error(
              'API returned HTML instead of JSON - possible redirect to login page'
            );
          }

          const profile = response.body as UserProfile;

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
          // Handle HTML response (redirect to login page)
          if (error.message && error.message.includes('HTML instead of JSON')) {
            console.log('API returned HTML - likely redirect to login page');
            this.showAuthErrorPage();
            return of(null);
          }

          // Handle 302 redirect - user needs authentication, show error page first
          if (error.status === 200) {
            console.log(
              'Profile API returned 302 - redirecting to error page before ETF website'
            );
            this.showAuthErrorPage();
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

          // Handle 500 - server error, redirect to profile page to add values first
          if (error.status === 500) {
            console.log(
              'Server error (500) - redirecting to profile page to add values first'
            );
            this.setRedirectToProfileFlag();
            this.set500ErrorFlag();
            this.redirectToProfilePage();
            return of(null);
          }

          // Handle authentication errors (401, 403)
          if (error.status === 401 || error.status === 403) {
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
    // Ensure we're sending FormData, not JSON
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

          // Reset redirect flags on successful profile creation/update
          this.resetRedirectFlags();

          return response;
        }),
        catchError((error) => {
          // Handle 500 - server error, redirect to profile page to add values first
          if (error.status === 500) {
            console.log(
              'Server error (500) during profile update - redirecting to profile page to add values first'
            );
            this.setRedirectToProfileFlag();
            this.set500ErrorFlag();
            this.redirectToProfilePage();
            return throwError(() => error);
          }

          // Handle authentication errors (401, 403)
          if (error.status === 401 || error.status === 403) {
            console.log(
              'Authentication error during profile update - redirecting to error page'
            );
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          // For other errors, redirect to main site
          console.log(
            'Unknown error during profile update - redirecting to main site'
          );
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

  /**
   * Set redirect to profile flag to prevent infinite loops
   */
  private setRedirectToProfileFlag(): void {
    this.hasRedirectedToProfile = true;
    this.redirectToProfileTimestamp = Date.now();
    console.log('Redirect to profile flag set - preventing infinite API calls');
  }

  /**
   * Set session storage flag to prevent API calls during 500 errors
   */
  private set500ErrorFlag(): void {
    sessionStorage.setItem('profile_500_error', 'true');
    console.log('500 error flag set - preventing API calls during 500 errors');
  }
}
