import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileService } from '../../../features/profile/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private profileService = inject(ProfileService);
  isScrolled = false;
  showUserMenu = false;

  ngOnInit(): void {
    // Load profile data when navbar initializes if user is authenticated
    if (this.isAuthenticated()) {
      this.loadUserProfileData();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  /**
   * Load user profile data to update navbar display
   */
  private loadUserProfileData(): void {
    // Check if we already have user data in localStorage
    const hasUserData =
      localStorage.getItem('userFullName') ||
      localStorage.getItem('userProfileImage');

    if (!hasUserData) {
      // Only load if we don't have data yet to avoid unnecessary API calls
      this.profileService.getProfile().subscribe({
        next: (profile) => {
          if (profile) {
            // Save user data to localStorage for navbar display
            this.saveUserDataToLocalStorage(profile);
          }
        },
        error: (error) => {
          console.log('Could not load profile data for navbar:', error);
          // Don't show error messages in navbar, just log it
        },
      });
    }
  }

  /**
   * Save user data to localStorage for navbar display
   */
  private saveUserDataToLocalStorage(profile: any): void {
    // Save user name
    if (profile.firstName && profile.lastName) {
      const fullName = `${profile.firstName} ${profile.lastName}`.trim();
      localStorage.setItem('userFullName', fullName);
      localStorage.setItem('userFirstName', profile.firstName);
      localStorage.setItem('userLastName', profile.lastName);
    }

    // Save profile image
    if (profile.imageLink) {
      localStorage.setItem('userProfileImage', profile.imageLink);
    }
  }

  /**
   * Logout user and redirect to ETF site
   */
  logout(): void {
    // Clear all authentication data using ProfileService
    this.profileService.logout();

    // Clear any additional localStorage items
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    this.clearAllCookies();

    // Redirect to ETF site
    window.location.href =
      'https://etfwebsite-gcf6ggathwd6ehgv.canadacentral-01.azurewebsites.net/';
  }

  /**
   * Clear all cookies from the domain
   */
  private clearAllCookies(): void {
    const cookies = document.cookie.split(';');

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Clear cookie with different path options
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  /**
   * Check if user is authenticated
   * @returns true if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.profileService.isAuthenticated();
  }

  /**
   * Redirect to login page
   */
  login(): void {
    window.location.href =
      'https://etfwebsite-gcf6ggathwd6ehgv.canadacentral-01.azurewebsites.net/landing-page/login';
  }

  /**
   * Get user name from localStorage
   * @returns User's full name or default text
   */
  getUserName(): string {
    const fullName = localStorage.getItem('userFullName');
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');

    if (fullName) {
      return fullName;
    } else if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    }

    return 'مرحباً بك';
  }

  /**
   * Get user profile image URL
   * @returns Profile image URL or null
   */
  getUserProfileImage(): string | null {
    const imageLink = localStorage.getItem('userProfileImage');
    if (!imageLink) return null;

    // Return the image link directly without any processing
    return imageLink;
  }

  /**
   * Navigate to profile page
   */
  goToProfile(): void {
    this.showUserMenu = false;
    window.location.href = '/profile';
  }

  /**
   * Toggle user menu visibility
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Close user menu when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showUserMenu = false;
    }
  }
}
