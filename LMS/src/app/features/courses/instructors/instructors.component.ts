import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../services/home-page.service';
import { Instructor } from '../model/instructor.model';
import { InstructorCardComponent } from '../../instructor-list/instructor-card/instructor-card.component';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, InstructorCardComponent],
  templateUrl: './instructors.component.html',
  styleUrl: './instructors.component.scss',
})
export class InstructorsComponent implements OnInit {
  private _homePageService = inject(HomePageService);

  // Get first 3 instructors from API only (no fallback to local JSON)
  instructorsData$ = this._homePageService
    .getInstructorsFromApi({
      page: 1,
      pageSize: 3,
      sortBy: 'Id',
      sortDir: 'asc',
    })
    .pipe(
      catchError((error) => {
        console.error('Error fetching instructors from API:', error);
        // Return empty array instead of falling back to local JSON
        return of([]);
      })
    );

  ngOnInit(): void {
    console.log(this.instructorsData$);
  }
}
