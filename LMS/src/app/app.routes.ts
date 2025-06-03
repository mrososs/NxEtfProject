import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'homepage',
    loadComponent: () =>
      import('./features/homepage/homepage.component').then(
        (c) => c.HomepageComponent
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
