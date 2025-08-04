import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ProfileService } from './features/profile/profile.service';
import { ProfileRequiredService } from './shared/services/profile-required.service';
import { ProfileRequiredDialogComponent } from './shared/components/profile-required-dialog/profile-required-dialog.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ErrorStateService } from './shared/services/error-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ProfileRequiredDialogComponent,
    NavbarComponent,
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
    private errorStateService: ErrorStateService
  ) {
    // Check if we're on error page to hide navbar
    this.checkIfOnErrorPage();
  }

  ngOnInit(): void {
    // Skip authentication check if we're on error page or already checked
    if (this.errorStateService.shouldSkipApiCalls() || this.hasCheckedAuth) {
      return;
    }

    // Check authentication on app startup
    this.profileService.checkAuthenticationOnStartup().subscribe({
      next: (isAuthenticated) => {
        this.hasCheckedAuth = true;
        if (isAuthenticated) {
          this.checkUserProfile();
        }
        // If not authenticated, redirect is handled by ProfileService
      },
      error: (error) => {
        this.hasCheckedAuth = true;
        // Error handling is done by ProfileService
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

  private checkIfOnErrorPage(): void {
    const isOnErrorPage = window.location.pathname === '/error-500';
    this.showNavbar = !isOnErrorPage;
    if (isOnErrorPage) {
      this.errorStateService.setErrorState(true);
    }
  }

  private checkUserProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        // Profile check completed
      },
      error: (error) => {
        // Profile doesn't exist, but don't show dialog immediately
        // Let individual components handle this
      },
    });
  }

  onCreateProfile(): void {
    this.profileRequiredService.hideProfileRequiredDialog();
    // Navigation will be handled by the dialog component
  }

  onCancelProfile(): void {
    this.profileRequiredService.hideProfileRequiredDialog();
  }
}
