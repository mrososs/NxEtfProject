// shared/auth/sso/sso.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SSOService {
  constructor(private auth: AuthService, private router: Router) {}

  generateStateToken(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  validateSSOToken(token: string) {
    return this.auth.loginWithPopup({
      authorizationParams: {
        prompt: 'none',
        login_hint: token, // أو احفظ التوكن في session إن احتجت
      },
    });
  }

  redirectTo(project: 'LMS' | 'news', token: string) {
    const projectUrls = {
      LMS: 'http://localhost:54631',
      news: 'http://localhost:4200',
    };

    const redirectUrl = `${projectUrls[project]}?token=${encodeURIComponent(
      token
    )}`;

    // تنظيف state بعد الاستخدام
    localStorage.removeItem('sso_state');

    window.location.href = redirectUrl;
  }
}
