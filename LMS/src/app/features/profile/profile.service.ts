import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  description?: string;
  imageUrl?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = environment.apiUrl;
  private readonly PROFILE_ENDPOINT = environment.profileEndpoint;

  constructor() {}

  /**
   * Get user profile from API
   */
  getUserProfile(): Observable<UserProfile | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .get<any>(`${this.API_BASE_URL}${this.PROFILE_ENDPOINT}`, { headers })
      .pipe(
        map((response) => {
          return this.transformApiResponseToProfile(response);
        }),
        catchError((error) => {
          // Check for "No Profile Created" error
          if (
            error.status === 404 ||
            (error.error &&
              error.error.message &&
              error.error.message.includes(
                'No Profile Created For This User Please Contact Your Administrator'
              ))
          ) {
            this.redirectToProfilePage();
            return of(null);
          }

          // Check for 500 error or other authentication errors
          if (
            error.status === 500 ||
            error.status === 401 ||
            error.status === 403
          ) {
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          // For any other error, redirect to main site
          this.redirectToMainSite();
          return throwError(() => error);
        })
      );
  }

  /**
   * Create new user profile
   */
  createProfile(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      // Don't set Content-Type for FormData, let browser set it with boundary
    });

    return this.http
      .post<any>(`${this.API_BASE_URL}${this.PROFILE_ENDPOINT}`, formData, {
        headers,
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          // Check for authentication errors
          if (
            error.status === 500 ||
            error.status === 401 ||
            error.status === 403
          ) {
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          this.redirectToMainSite();
          return throwError(() => error);
        })
      );
  }

  /**
   * Update existing user profile
   */
  updateProfile(formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      // Don't set Content-Type for FormData, let browser set it with boundary
    });

    return this.http
      .put<any>(`${this.API_BASE_URL}${this.PROFILE_ENDPOINT}`, formData, {
        headers,
      })
      .pipe(
        map((response) => {
          return response;
        }),
        catchError((error) => {
          // Check for authentication errors
          if (
            error.status === 500 ||
            error.status === 401 ||
            error.status === 403
          ) {
            this.showAuthErrorPage();
            return throwError(() => error);
          }

          this.redirectToMainSite();
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user has a profile
   */
  hasProfile(): Observable<boolean> {
    return this.getUserProfile().pipe(
      map((profile) => {
        return profile !== null;
      }),
      catchError((error) => {
        // Check for "No Profile Created" error
        if (
          error.status === 404 ||
          (error.error &&
            error.error.message &&
            error.error.message.includes(
              'No Profile Created For This User Please Contact Your Administrator'
            ))
        ) {
          return of(false);
        }

        // For other errors, return false
        return of(false);
      })
    );
  }

  /**
   * Get authentication token from localStorage or cookie
   */
  private getAuthToken(): string | null {
    // Try localStorage first
    const authToken = localStorage.getItem('authToken');
    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('accessToken');

    if (authToken) {
      return authToken;
    }

    if (token) {
      return token;
    }

    if (accessToken) {
      return accessToken;
    }

    // Try to get from cookies
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');

      if (name === 'authToken' || name === 'token' || name === 'accessToken') {
        return value;
      }
    }

    return null;
  }

  /**
   * Get user ID from localStorage or cookie
   */
  getUserId(): string | null {
    return (
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      this.getCookieValue('userId') ||
      this.getCookieValue('user_id')
    );
  }

  /**
   * Get cookie value by name
   */
  private getCookieValue(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  /**
   * Transform API response to UserProfile interface
   */
  private transformApiResponseToProfile(response: any): UserProfile {
    return {
      id: response.id,
      firstName: response.firstName || response.first_name,
      middleName: response.middleName || response.middle_name,
      lastName: response.lastName || response.last_name,
      description: response.description,
      imageUrl: response.imageUrl || response.image_url || response.image,
      userId: response.userId || response.user_id,
      createdAt: response.createdAt || response.created_at,
      updatedAt: response.updatedAt || response.updated_at,
    };
  }

  /**
   * Check if user is authenticated by calling the API
   */
  isAuthenticated(): Observable<boolean> {
    return this.getUserProfile().pipe(
      map((profile) => {
        return true;
      }),
      catchError((error) => {
        // Check for "No Profile Created" error - user is authenticated but no profile
        if (
          error.status === 404 ||
          (error.error &&
            error.error.message &&
            error.error.message.includes(
              'No Profile Created For This User Please Contact Your Administrator'
            ))
        ) {
          this.redirectToProfilePage();
          return of(false);
        }

        // Check for authentication errors (401, 403, 500)
        if (
          error.status === 500 ||
          error.status === 401 ||
          error.status === 403
        ) {
          this.showAuthErrorPage();
          return of(false);
        }

        // For other errors, redirect to main site
        this.redirectToMainSite();
        return of(false);
      })
    );
  }

  /**
   * Check authentication on app startup
   */
  checkAuthenticationOnStartup(): Observable<boolean> {
    return this.getUserProfile().pipe(
      map((profile) => {
        return true;
      }),
      catchError((error) => {
        // Check for 401 Not Authorized error
        if (error.status === 401) {
          this.showAuthErrorPage();
          return of(false);
        }

        // Check for "No Profile Created" error
        if (
          error.status === 404 ||
          (error.error &&
            error.error.message &&
            error.error.message.includes(
              'No Profile Created For This User Please Contact Your Administrator'
            ))
        ) {
          this.redirectToProfilePage();
          return of(false);
        }

        // Check for other authentication errors
        if (error.status === 500 || error.status === 403) {
          this.showAuthErrorPage();
          return of(false);
        }

        // For other errors, redirect to main site
        this.redirectToMainSite();
        return of(false);
      })
    );
  }

  /**
   * Redirect to main site
   */
  private redirectToMainSite(): void {
    window.location.href = 'http://etf.itechpro-eg.com/';
  }

  /**
   * Redirect to profile page
   */
  private redirectToProfilePage(): void {
    window.location.href = '/profile';
  }

  /**
   * Show authentication error page
   */
  private showAuthErrorPage(): void {
    // Navigate to the error-500 page
    window.location.href = '/error-500';
  }

  /**
   * Clear authentication data
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user_id');

    // Clear cookies
    document.cookie =
      'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
