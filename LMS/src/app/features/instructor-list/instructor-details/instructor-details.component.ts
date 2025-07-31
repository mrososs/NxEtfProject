import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../../courses/services/home-page.service';
import { Instructor } from '../../courses/model/instructor.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-instructor-details',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './instructor-details.component.html',
  styleUrl: './instructor-details.component.scss',
})
export class InstructorDetailsComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _homePageService = inject(HomePageService);

  instructor!: Instructor;
  loading = true;
  error = false;
  instructorId!: number;

  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.instructorId = +params['id'];
      this.loadInstructorDetails();
    });
  }

  private loadInstructorDetails(): void {
    this.loading = true;
    this.error = false;

    this._homePageService
      .getInstructorByIdFromApi(this.instructorId)
      .subscribe({
        next: (instructor: Instructor) => {
          this.instructor = instructor;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching instructor details:', err);
          this.error = true;
          this.loading = false;
        },
      });
  }

  getChannelLinks(): { name: string; links: string[] }[] {
    if (!this.instructor?.channels) return [];

    return Object.entries(this.instructor.channels).map(([name, links]) => ({
      name,
      links,
    }));
  }
}
