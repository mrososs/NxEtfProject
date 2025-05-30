import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SSOService {
  constructor(private auth: AuthService, private router: Router) {}

  // للانتقال للمشروع الثاني مع SSO
  navigateToProject2() {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        // الحصول على التوكن ثم الانتقال
        this.auth.getAccessTokenSilently().subscribe((token) => {
          const project2Url = 'https://project2-domain.com';
          const redirectUrl = `${project2Url}/auth-callback?token=${encodeURIComponent(
            token
          )}`;
          window.location.href = redirectUrl;
        });
      } else {
        this.auth.loginWithRedirect();
      }
    });
  }

  // للتحقق من SSO عند بدء التشغيل
  checkSSOState() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      this.auth
        .loginWithPopup({
          authorizationParams: {
            prompt: 'none',
            login_hint: token,
          },
        })
        .subscribe({
          complete: () => {
            // تنظيف الـ URL بعد نجاح العملية
            this.router.navigateByUrl('/');
          },
          error: () => {
            this.auth.loginWithRedirect();
          },
        });
    }
  }
}
