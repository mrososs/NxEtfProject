// shared/auth/sso/sso-lms.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SSOService } from './sso.service';

@Injectable({ providedIn: 'root' })
export class SSOLmsService {
  constructor(private auth: AuthService, private ssoService: SSOService) {}

 handleAuthCallback() {
    this.auth.handleRedirectCallback().subscribe({
      next: (result) => {
        console.log('Auth callback handled in LMS:', result);
        // Optionally clear sso_state from localStorage
        localStorage.removeItem('sso_state');
      },
      error: (err) => {
        console.error('Error handling auth callback in LMS:', err);
      },
    });
  }

  private checkAuthState() {
    this.auth.isAuthenticated$.subscribe((isAuth) => {
      if (!isAuth) {
        this.redirectToNews();
      }
    });
  }

  private redirectToNews() {
    this.ssoService.redirectTo('news', '');
  }
}
