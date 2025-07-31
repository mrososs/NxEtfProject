import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Profile, ProfileResponse } from '../model/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private _http = inject(HttpClient);

  // Mock profile data
  private mockProfile: Profile = {
    id: 1,
    image: 'assets/img/instructor-avatar.png',
    imageLink: 'assets/img/instructor-avatar.png',
    firstName: 'احمد',
    middleName: 'ياسر',
    lastName: 'محمد',
    description:
      'مرحباً، أنا احمد ياسر محمد، شغوف بالتعلم والتطوير والتطوير المستمر. لدي خبرة في مجال التعليم الإلكتروني وأسعى دائماً لمشاركة المعرفة وإحداث تأثير إيجابي. أحب التعلم المستمر والابتكار والعمل على المشاريع المبتكرة. هدفي هو تطوير مهاراتي وتقديم قيمة حقيقية للمجتمع، وأتطلع للتواصل مع الأشخاص الذين يشاركون نفس الاهتمامات. لا تتردد في التواصل معي! 😊',
    user: {
      username: 'ahmed_yasser',
      email: 'ahmed@example.com',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
  };

  /**
   * Get user profile data
   * @returns Observable of profile data
   */
  getProfile(): Observable<Profile> {
    // Return mock data instead of API call
    return of(this.mockProfile);

    // Original API call (commented out for now)
    // return this._http.get<Profile>('http://etfapi.itechpro-eg.com/me');
  }

  /**
   * Update user profile
   * @param profile - The updated profile data
   * @returns Observable of update response
   */
  updateProfile(profile: Partial<Profile>): Observable<ProfileResponse> {
    // Update mock data
    this.mockProfile = { ...this.mockProfile, ...profile };

    const mockResponse: ProfileResponse = {
      success: true,
      data: this.mockProfile,
      message: 'Profile updated successfully',
    };

    return of(mockResponse);

    // Original API call (commented out for now)
    // return this._http.put<ProfileResponse>('me', profile);
  }

  /**
   * Upload profile image
   * @param imageFile - The image file to upload
   * @returns Observable of upload response
   */
  uploadProfileImage(imageFile: File): Observable<ProfileResponse> {
    // Create a mock image URL
    const mockImageUrl = URL.createObjectURL(imageFile);
    this.mockProfile.image = mockImageUrl;
    this.mockProfile.imageLink = mockImageUrl;

    const mockResponse: ProfileResponse = {
      success: true,
      data: this.mockProfile,
      message: 'Image uploaded successfully',
    };

    return of(mockResponse);

    // Original API call (commented out for now)
    // const formData = new FormData();
    // formData.append('image', imageFile);
    // return this._http.post<ProfileResponse>('me/upload-image', formData);
  }

  /**
   * Get full name from profile
   * @param profile - The profile object
   * @returns Full name string
   */
  getFullName(profile: Profile): string {
    const parts = [profile.firstName, profile.middleName, profile.lastName]
      .filter((part) => part && part.trim() !== '')
      .map((part) => part.trim());

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
      .map((part) => part.trim());

    return parts.join(' ');
  }
}
