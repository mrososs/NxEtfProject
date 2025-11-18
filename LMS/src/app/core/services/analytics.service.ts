import { Inject, Injectable, Optional, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type CourseType = 'free' | 'paid' | 'premium';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private siteVisitorTracked$: Observable<any> | null = null;

  constructor(
    @Optional() @Inject(DOCUMENT) private readonly doc: Document | null
  ) {}

  /**
   * Push a generic event to the GTM dataLayer
   */
  pushEvent(eventName: string, data: Record<string, unknown> = {}): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...data });

    // eslint-disable-next-line no-console
    console.log('[GA4]', eventName, data);
  }

  /**
   * Manual page view tracking
   */
  trackPageView(path: string, title?: string, referrer?: string): void {
    const pageLocation =
      typeof location !== 'undefined' ? location.href : undefined;

    const pageReferrer = referrer ?? (this.doc?.referrer || undefined);

    this.pushEvent('page_view', {
      page_path: path,
      page_title: title ?? this.doc?.title,
      page_referrer: pageReferrer,
      page_location: pageLocation,
    });
  }

  /**
   * Track user login and set user ID
   */
  trackLogin(userId: string, method: string): void {
    this.pushEvent('user_login', { user_id: userId, method });
    this.setUserId(userId);
  }

  /**
   * Track user logout and clear user ID
   */
  trackLogout(): void {
    this.pushEvent('user_logout', {});
    this.clearUserId();
  }

  /**
   * Set GA4 user ID
   */
  setUserId(userId: string): void {
    this.pushEvent('set_user_id', { user_id: userId });
  }

  /**
   * Clear GA4 user ID
   */
  clearUserId(): void {
    this.pushEvent('clear_user_id', {});
  }

  /**
   * Set GA4 user properties
   */
  setUserProperties(props: {
    education_level?: string;
    city?: string;
    country?: string;
  }): void {
    this.pushEvent('set_user_props', props);
  }

  /**
   * Track course enrollment
   */
  trackCourseEnrolled(
    courseId: string,
    courseName: string,
    level: string,
    courseType: CourseType = 'free',
    rating?: number
  ): void {
    this.pushEvent('course_enrolled', {
      course_id: courseId,
      course_name: courseName,
      level,
      course_type: courseType,
      rating: rating ?? 0,
    });
  }

  /**
   * Track course completion
   */
  trackCourseCompleted(courseId: string, courseName: string): void {
    this.pushEvent('course_completed', {
      course_id: courseId,
      course_name: courseName,
    });
  }

  /**
   * Track course rating
   */
  trackCourseRated(courseId: string, courseName: string, rating: number): void {
    this.pushEvent('course_rated', {
      course_id: courseId,
      course_name: courseName,
      rating,
    });
  }

  /**
   * Track certificate printing
   */
  trackCertificatePrint(courseId: string, courseName: string): void {
    this.pushEvent('certificate_print', {
      course_id: courseId,
      course_name: courseName,
    });
  }

  /**
   * Track site visitor - called once per session using shareReplay(1)
   * POST /api/Analytics/sitevisitors (no body)
   */
  trackSiteVisitor(): Observable<any> {
    if (!this.siteVisitorTracked$) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      this.siteVisitorTracked$ = this.http
        .post('/api/Analytics/sitevisitors', null, { headers })
        .pipe(shareReplay(1));
    }
    return this.siteVisitorTracked$;
  }

  /**
   * Track site page visit
   * POST /api/Analytics/sitepagevisits
   * Body: { pageName: string, pageUrl: string }
   */
  trackSitePageVisit(pageName: string, pageUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = {
      pageName,
      pageUrl,
    };

    return this.http.post('/api/Analytics/sitepagevisits', body, { headers });
  }

  /**
   * Track certificate download
   * POST /api/Analytics
   * Body: { courseId: number }
   */
  trackCertificateDownload(courseId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const body = {
      courseId,
    };

    return this.http.post('/api/Analytics/courseCertificatesVisit', body, {
      headers,
    });
  }
}
