import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ProfileService } from './features/profile/profile.service';
import { ProfileRequiredService } from './shared/services/profile-required.service';
import { ProfileRequiredDialogComponent } from './shared/components/profile-required-dialog/profile-required-dialog.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ErrorStateService } from './shared/services/error-state.service';
import { AiAssistantComponent } from './shared/components/ai-assistant/ai-assistant.component';
import { FooterComponent } from './features/footer/footer.component';
import { SessionExpiryService } from './core/services/session-expiry.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ProfileRequiredDialogComponent,
    NavbarComponent,
    AiAssistantComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  showProfileDialog = false;
  private hasCheckedAuth = false;
  showNavbar = true;

  constructor(
    private profileService: ProfileService,
    private profileRequiredService: ProfileRequiredService,
    private router: Router,
    private errorStateService: ErrorStateService,
    private sessionExpiryService: SessionExpiryService
  ) {
    // Check if we're on error page to hide navbar
    this.checkIfOnErrorPage();
  }

  ngOnInit(): void {
    // Check session expiry first - if expired, user will be redirected to login
    if (this.sessionExpiryService.isSessionExpired()) {
      this.sessionExpiryService.handleExpiredSession();
      return;
    }

    // Skip authentication check if we're on error page, already checked, or on courses page
    if (
      this.errorStateService.shouldSkipApiCalls() ||
      this.hasCheckedAuth ||
      this.isOnCoursesPage()
    ) {
      return;
    }

    // Handle token from URL parameters first
    this.handleTokenFromUrl();

    // Check if token exists in localStorage and extract role
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.decodeAndSaveRole(storedToken);
    }

    // Check authentication on app startup
    this.profileService.checkAuthenticationOnStartup().subscribe({
      next: (isAuthenticated) => {
        this.hasCheckedAuth = true;
        this.showNavbar = isAuthenticated; // Show navbar only for authenticated users
        if (isAuthenticated) {
          this.checkUserProfile();
        } else {
          // Redirect unauthenticated users to courses page
          this.router.navigate(['/courses']);
        }
      },
      error: (error) => {
        this.hasCheckedAuth = true;
        this.showNavbar = false; // Hide navbar for unauthenticated users
        // Redirect to courses page for unauthenticated users
        this.router.navigate(['/courses']);
      },
    });

    // Subscribe to profile required dialog
    this.profileRequiredService.showDialog$.subscribe((show) => {
      this.showProfileDialog = show;
    });

    // Subscribe to error state changes
    this.errorStateService.isOnErrorPage$.subscribe((isOnErrorPage) => {
      this.showNavbar = !isOnErrorPage;
    });
  }

  /**
   * Handle token from URL parameters when application starts
   * This is called when user comes from external app with token in URL
   */
  private handleTokenFromUrl(): void {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
      console.log(
        'Token found in URL parameters from external app, saving to localStorage'
      );

      // Save token to localStorage
      localStorage.setItem('authToken', tokenFromUrl);
      localStorage.setItem('token', tokenFromUrl);
      localStorage.setItem('accessToken', tokenFromUrl);
      localStorage.setItem('auth_token', tokenFromUrl); // Match the key used by external app

      // Save login timestamp for session expiry tracking
      this.sessionExpiryService.saveLoginTimestamp();

      // Clean up URL by removing token parameter
      // This prevents the token from being visible in browser history
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');

      // Replace current URL without token parameters
      window.history.replaceState({}, document.title, newUrl.toString());

      console.log('Token saved and URL cleaned up');

      // Decode token and extract role
      this.decodeAndSaveRole(tokenFromUrl);
    }
  }

  /**
   * Decode token and save user role if LMSAdmin
   */
  private decodeAndSaveRole(token: string): void {
    try {
      const decoded: any = jwtDecode(token);
      console.log('Decoded token:', decoded);

      const roleClaim =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      if (decoded && decoded[roleClaim]) {
        const role = decoded[roleClaim];
        console.log('User Role found:', role);

        if (role === 'LMSAdmin') {
          localStorage.setItem('role', role);
          console.log('Role LMSAdmin saved to localStorage');
        } else {
          // Can clear or just set whatever role
          localStorage.setItem('role', role);
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  private checkIfOnErrorPage(): void {
    const isOnErrorPage = window.location.pathname === '/error-500';
    this.showNavbar = !isOnErrorPage;
    if (isOnErrorPage) {
      this.errorStateService.setErrorState(true);
    }
  }

  private isOnCoursesPage(): boolean {
    const currentPath = window.location.pathname;
    return (
      currentPath === '/courses' || currentPath === '/' || currentPath === ''
    );
  }

  private checkUserProfile(): void {
    // Skip profile check if we're in 500 error mode
    if (this.profileService.isIn500ErrorMode()) {
      console.log('Skipping profile check due to 500 error mode');
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        // Profile check completed - save data to localStorage for navbar
        if (profile) {
          this.saveUserDataToLocalStorage(profile);
        }
      },
      error: (error) => {
        // Profile doesn't exist - force user to create profile
        console.log('No profile found, forcing user to create profile');
        this.profileRequiredService.showProfileRequiredDialog();
      },
    });
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

  onCreateProfile(): void {
    this.profileRequiredService.hideProfileRequiredDialog();
    // Navigation will be handled by the dialog component
  }

  onCancelProfile(): void {
    this.profileRequiredService.hideProfileRequiredDialog();
  }
}
