import { Route } from '@angular/router';
import { ErrorPageGuard } from './core/guards/error-page.guard';
import { AuthGuard } from './core/guards/auth.guard';

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
    canActivate: [AuthGuard],
  },
  {
    path: 'course-viewer',
    loadComponent: () =>
      import('./features/course-viewer/course-viewer.component').then(
        (m) => m.CourseViewerComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'instructorDetails/:id',
    loadComponent: () =>
      import(
        './features/instructor-list/instructor-details/instructor-details.component'
      ).then((c) => c.InstructorDetailsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'homepage',
    loadComponent: () =>
      import('./features/homepage/homepage.component').then(
        (c) => c.HomepageComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./features/blogs/blogs.component').then((c) => c.BlogsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'blogs/:slug',
    loadComponent: () =>
      import('./features/blogs/blog-details/blog-details.component').then(
        (c) => c.BlogDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (c) => c.FavoritesComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(
        (c) => c.CoursesComponent
      ),
    // No guard for courses page - it's the landing page
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-details/course-details.component').then(
        (c) => c.CourseDetailsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [AuthGuard],
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
