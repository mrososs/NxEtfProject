import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BannerComponent } from '../homepage/banner/banner.component';
import { HomePageService } from '../courses/services/home-page.service';
import { InstructorCardComponent } from './instructor-card/instructor-card.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [CommonModule, BannerComponent, InstructorCardComponent, AsyncPipe],
  templateUrl: './instructor-list.component.html',
  styleUrl: './instructor-list.component.scss',
})
export class InstructorListComponent {
  private _homePageService = inject(HomePageService);

  // Get all instructors from API with pagination
  instructorsData$ = this._homePageService
    .getInstructorsFromApi({
      page: 1,
      pageSize: 20, // Get more instructors for the list
      sortBy: 'Id', // Use 'Id' as shown in Swagger documentation
      sortDir: 'desc',
    })
    .pipe(
      catchError((error) => {
        console.error('Error fetching instructors from API:', error);
        // Fallback to local data if API fails
        return this._homePageService.getInstructors();
      })
    );
}
