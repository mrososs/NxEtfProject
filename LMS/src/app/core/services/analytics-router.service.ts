import { Inject, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { AnalyticsService } from './analytics.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsRouterService {
  private inited = false;

  constructor(
    private readonly router: Router,
    private readonly title: Title,
    private readonly analytics: AnalyticsService,
    @Inject(DOCUMENT) private readonly doc: Document
  ) {}

  /** Initialize router-based analytics tracking */
  init(): void {
    if (this.inited) {
      return;
    }

    this.inited = true;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects || event.url;
        const pageTitle = this.title.getTitle();
        const referrer = this.doc.referrer || undefined;

        // Track page view for GTM
        this.analytics.trackPageView(path, pageTitle, referrer);

        // Track page visit for API analytics
        const pageUrl = typeof window !== 'undefined' ? window.location.href : path;
        const pageName = this.getPageName(path);
        this.analytics.trackSitePageVisit(pageName, pageUrl).subscribe({
          next: () => {
            // Successfully tracked
          },
          error: (error) => {
            // Silently handle errors to not disrupt user experience
            console.error('Error tracking page visit:', error);
          },
        });
      });
  }

  /**
   * Extract page name from route path
   */
  private getPageName(path: string): string {
    // Remove query parameters and hash
    const cleanPath = path.split('?')[0].split('#')[0];

    // Map common routes to readable names
    const routeMap: Record<string, string> = {
      '/': 'Home',
      '/courses': 'Courses',
      '/homepage': 'Homepage',
      '/blogs': 'Blogs',
      '/favorites': 'Favorites',
      '/instructor': 'Instructor',
      '/profile': 'Profile',
    };

    // Check if it's a course details page
    if (cleanPath.startsWith('/courses/') && cleanPath !== '/courses') {
      return 'Course Details';
    }

    // Check if it's a blog details page
    if (cleanPath.startsWith('/blogs/') && cleanPath !== '/blogs') {
      return 'Blog Details';
    }

    // Return mapped name or use the path itself
    return routeMap[cleanPath] || cleanPath;
  }
}

