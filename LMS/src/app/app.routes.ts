import { Route } from '@angular/router';
import { ErrorPageGuard } from './core/guards/error-page.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'instructor',
    loadComponent: () =>
      import('./features/instructor-list/instructor-list.component').then(
        (m) => m.InstructorListComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'course-viewer',
    loadComponent: () =>
      import('./features/course-viewer/course-viewer.component').then(
        (m) => m.CourseViewerComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'instructorDetails/:id',
    loadComponent: () =>
      import(
        './features/instructor-list/instructor-details/instructor-details.component'
      ).then((c) => c.InstructorDetailsComponent),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'homepage',
    loadComponent: () =>
      import('./features/homepage/homepage.component').then(
        (c) => c.HomepageComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./features/blogs/blogs.component').then((c) => c.BlogsComponent),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'blogsDetails/:id',
    loadComponent: () =>
      import('./features/blogs/blog-details/blog-details.component').then(
        (c) => c.BlogDetailsComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (c) => c.FavoritesComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(
        (c) => c.CoursesComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-details/course-details.component').then(
        (c) => c.CourseDetailsComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [ErrorPageGuard],
  },
  {
    path: 'error-500',
    loadComponent: () =>
      import('./shared/components/error-500/error-500.component').then(
        (c) => c.Error500Component
      ),
    // No guard for error-500 page
  },
];
