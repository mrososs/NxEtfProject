import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private projectRoutes = {
    news: {
      baseUrl: 'http://localhost:55431', // بورت مشروع news
      routes: {
        home: '/landing-page/home',
        union: '/landing-page/union',
        training: '/landing-page/training',
        tourism: '/landing-page/Tourism-legislation',
        contact: '/landing-page/contact-us',
        news: '/landing-page/news',
        hotelRoom: '/landing-page/hotel-room',
        travelRoom: '/landing-page/travel-room',
        eatRoom: '/landing-page/eat-room',
        divingRoom: '/landing-page/diving-room',
        productsRoom: '/landing-page/product-room',
      },
    },
    lms: {
      baseUrl: 'http://localhost:4200', // بورت مشروع lms
      routes: {
        home: '/landing-page/home',
        courses: '/courses',
        dashboard: '/dashboard',
      },
    },
  };

  constructor(private router: Router) {}

  getCurrentProject(): 'news' | 'lms' {
    const url = window.location.pathname;
    if (url.startsWith('/lms')) return 'lms';
    return 'news'; // default fallback
  }

  navigateTo(projectKey: 'news' | 'lms', routeKey: string) {
    const target = this.projectRoutes[projectKey];
    const route = target.routes[routeKey as keyof typeof target.routes];

    if (!route) return;

    // Full page redirect
    window.location.href = `${target.baseUrl}${route}`;
  }

  isRouteActive(projectKey: 'news' | 'lms', routeKey: string): boolean {
    const target = this.projectRoutes[projectKey];
    const route = target.routes[routeKey as keyof typeof target.routes];
    if (!route) return false;

    // نطابق المسار بالكامل بدل contains
    const expectedPath = new URL(route, target.baseUrl).pathname;
    return window.location.pathname === expectedPath;
  }
}
