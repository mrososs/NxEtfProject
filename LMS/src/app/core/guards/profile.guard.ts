// core/guards/profile.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const ProfileGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http
    .get('/api/profile/me', {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      observe: 'response',
      // responseType الافتراضي json، بس لو السيرفر بيرجع HTML في الـ redirect
      // هنكشفه من الـ content-type أدناه
    })
    .pipe(
      map((response) => {
        const contentType = response.headers.get('content-type') || '';
        // لو السيرفر رجّع HTML (سيشن انتهت/Redirect من السيرفر)
        if (contentType.includes('text/html')) {
          return router.createUrlTree(['/profile']);
        }

        const profile: any = response.body;
        // اعتبر البروفايل صالح لو فيه اسمين على الأقل
        if (profile?.firstName && profile?.lastName) {
          return true;
        }
        return router.createUrlTree(['/profile']);
      }),
      catchError((error) => {
        // أي Error => روح للـ profile يعمل إنشاء
        return of(router.createUrlTree(['/profile']));
      })
    );
};
