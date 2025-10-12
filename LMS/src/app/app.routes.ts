// app.routes.ts
import { Route } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileGuard } from './core/guards/profile.guard';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },

  // عام (بدون أي حراسة)
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(
        (m) => m.CoursesComponent
      ),
  },
  {
    path: 'error-500',
    loadComponent: () =>
      import('./shared/components/error-500/error-500.component').then(
        (c) => c.Error500Component
      ),
  },

  // صفحة إنشاء/تعديل البروفايل: لازم يبقى مُسجّل، بس حتى لو مفيش بروفايل يدخلها
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (c) => c.ProfileComponent
      ),
    canActivate: [AuthGuard],
  },

  // باقي الصفحات “المحمية” — لازم Auth + Profile
  {
    path: 'homepage',
    loadComponent: () =>
      import('./features/homepage/homepage.component').then(
        (c) => c.HomepageComponent
      ),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./features/blogs/blogs.component').then((c) => c.BlogsComponent),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'blogs/:slug',
    loadComponent: () =>
      import('./features/blogs/blog-details/blog-details.component').then(
        (c) => c.BlogDetailsComponent
      ),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (c) => c.FavoritesComponent
      ),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'instructor',
    loadComponent: () =>
      import('./features/instructor-list/instructor-list.component').then(
        (m) => m.InstructorListComponent
      ),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'instructorDetails/:id',
    loadComponent: () =>
      import(
        './features/instructor-list/instructor-details/instructor-details.component'
      ).then((c) => c.InstructorDetailsComponent),
    canActivate: [AuthGuard, ProfileGuard],
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-details/course-details.component').then(
        (c) => c.CourseDetailsComponent
      ),
    canActivate: [AuthGuard, ProfileGuard],
  },
];
