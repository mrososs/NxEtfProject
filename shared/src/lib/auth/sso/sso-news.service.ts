// shared/auth/sso/sso-news.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { SSOService } from './sso.service';

@Injectable({ providedIn: 'root' })
export class SSONewsService {
  constructor(private auth: AuthService, private ssoService: SSOService) {}

  navigateToLMS() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.auth.getAccessTokenSilently().subscribe(token => {
          this.ssoService.redirectTo('LMS', token);
        });
      } else {
        this.auth.loginWithRedirect({
          authorizationParams: {
            appState: { target: '/redirect-to-lms' }
          }
        });
      }
    });
  }

handleReturnFromLMS() {
  this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
    if (isAuthenticated) {
      this.auth.getAccessTokenSilently().subscribe((token) => {
        const state = localStorage.getItem('sso_state');
        const queryParams = new URLSearchParams({
          token,
          state: state ?? '',
        });

        // 👇 تضيف التوكن لـ URL بتاع news
        window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`);
      });
    }
  });
}

}