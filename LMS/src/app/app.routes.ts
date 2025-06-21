import { Route } from '@angular/router';

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
  },
  {
    path: 'course-viewer',
    loadComponent: () =>
      import('./features/course-viewer/course-viewer.component').then(
        (m) => m.CourseViewerComponent
      ),
  },
  {
    path: 'instructorDetails/:id',
    loadComponent: () =>
      import(
        './features/instructor-list/instructor-details/instructor-details.component'
      ).then((c) => c.InstructorDetailsComponent),
  },
  {
    path: 'homepage',
    loadComponent: () =>
      import('./features/homepage/homepage.component').then(
        (c) => c.HomepageComponent
      ),
  },
  {
    path: 'blogs',
    loadComponent: () =>
      import('./features/blogs/blogs.component').then((c) => c.BlogsComponent),
  },
  {
    path: 'blogsDetails/:id',
    loadComponent: () =>
      import('./features/blogs/blog-details/blog-details.component').then(
        (c) => c.BlogDetailsComponent
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
        (c) => c.FavoritesComponent
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses.component').then(
        (c) => c.CoursesComponent
      ),
  },
];
