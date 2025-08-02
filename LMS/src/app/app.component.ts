import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from './features/profile/profile.service';
import { ProfileRequiredService } from './shared/services/profile-required.service';
import { ProfileRequiredDialogComponent } from './shared/components/profile-required-dialog/profile-required-dialog.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

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

  constructor(
    private profileService: ProfileService,
    private profileRequiredService: ProfileRequiredService
  ) {}

  ngOnInit(): void {
    // Check authentication on app startup
    this.profileService.checkAuthenticationOnStartup().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.checkUserProfile();
        }
        // If not authenticated, redirect is handled by ProfileService
      },
      error: (error) => {
        // Error handling is done by ProfileService
      },
    });

    // Subscribe to profile required dialog
    this.profileRequiredService.showDialog$.subscribe((show) => {
      this.showProfileDialog = show;
    });
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
