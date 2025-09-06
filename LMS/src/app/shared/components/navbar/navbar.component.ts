import { Component, HostListener, inject } from '@angular/core';
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
export class NavbarComponent {
  private profileService = inject(ProfileService);
  isScrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
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
}
