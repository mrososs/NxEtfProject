import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Profile,
  ProfileResponse,
  Education,
  Experience,
  Skill,
  Contact,
} from '../model/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _http = inject(HttpClient);
  private readonly baseUrl =
    'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api';

  // Flags for error handling
  private _isInRedirectPreventionMode = false;
  private _isIn500ErrorMode = false;

  /**
   * Get user profile data
   * @returns Observable of profile data
   */
  getProfile(): Observable<Profile> {
    // Check if we're in redirect prevention mode
    if (this._isInRedirectPreventionMode) {
      return of(null as any);
    }

    return this._http.get<Profile>(`${this.baseUrl}/Profile/me`).pipe(
      map((profile) => {
        // Reset error flags on successful response
        this._isIn500ErrorMode = false;
        this._isInRedirectPreventionMode = false;

        // Ensure arrays are initialized if they don't exist
        if (profile) {
          profile.courses = profile.courses || [];
          profile.educations = profile.educations || [];
          profile.experiences = profile.experiences || [];
          profile.skills = profile.skills || [];
          profile.contacts = profile.contacts || [];
        }

        return profile;
      }),
      catchError((error) => {
        console.error('Error loading profile:', error);

        if (error.status === 500) {
          this._isIn500ErrorMode = true;
        }

        // Return null to indicate no profile exists
        return of(null as any);
      })
    );
  }

  /**
   * Get full name from profile
   * @param profile - The profile object
   * @returns Full name string
   */
  getFullName(profile: Profile): string {
    const parts = [profile.firstName, profile.middleName, profile.lastName]
      .filter((part) => part && part.trim() !== '')
      .map((part) => part!.trim());

    return parts.join(' ');
  }

  /**
   * Get display name (first and last name only)
   * @param profile - The profile object
   * @returns Display name string
   */
  getDisplayName(profile: Profile): string {
    const parts = [profile.firstName, profile.lastName]
      .filter((part) => part && part.trim() !== '')
      .map((part) => part!.trim());

    return parts.join(' ');
  }

  /**
   * Update profile with new data including education, experience, skills, and contacts
   * @param formData - FormData containing all profile information
   * @returns Observable of update response
   */
  postProfile(formData: FormData): Observable<ProfileResponse> {
    return this._http
      .post<ProfileResponse>(`${this.baseUrl}/Profile/me`, formData, {
        // Angular automatically sets Content-Type to multipart/form-data for FormData
        // No need to set headers manually
      })
      .pipe(
        map((response) => {
          // Reset error flags on successful response
          this._isIn500ErrorMode = false;
          this._isInRedirectPreventionMode = false;
          return response;
        }),
        catchError((error) => {
          console.error('Error updating profile:', error);

          if (error.status === 500) {
            this._isIn500ErrorMode = true;
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh profile data from cache
   * @returns Observable of profile data
   */
  refreshProfile(): Observable<Profile> {
    return this.getProfile();
  }

  /**
   * Check if we're in redirect prevention mode
   * @returns boolean
   */
  isInRedirectPreventionMode(): boolean {
    return this._isInRedirectPreventionMode;
  }

  /**
   * Check if we're in 500 error mode
   * @returns boolean
   */
  isIn500ErrorMode(): boolean {
    return this._isIn500ErrorMode;
  }

  /**
   * Reset redirect flags
   */
  resetRedirectFlags(): void {
    this._isInRedirectPreventionMode = false;
    this._isIn500ErrorMode = false;
  }
}
