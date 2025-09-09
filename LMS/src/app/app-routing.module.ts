import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './features/homepage/homepage.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ProfileGuard } from './core/guards/profile.guard';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'profile', component: ProfileComponent },
  // Protected routes that require profile
  {
    path: 'courses',
    loadChildren: () =>
      import('./features/courses/courses.module').then((m) => m.CoursesModule),
    canActivate: [ProfileGuard],
  },
  {
    path: 'instructors',
    loadChildren: () =>
      import('./features/instructor-list/instructor-list.module').then(
        (m) => m.InstructorListModule
      ),
    canActivate: [ProfileGuard],
  },
 
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
