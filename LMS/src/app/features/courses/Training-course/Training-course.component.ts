import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HomePageService } from '../services/home-page.service';
import { Course } from '../model/course.model';
import { CourseCardComponent } from '../../homepage/course-card/course-card.component';

@Component({
  selector: 'app-training-course',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule,CourseCardComponent],
  templateUrl: './Training-course.component.html',
  styleUrl: './Training-course.component.scss',
})
export class TrainingCourseComponent implements OnInit {
  private _homePageService = inject(HomePageService);
  coursesData!: Course[];
  ngOnInit(): void {
    this._homePageService.getCourses().subscribe(
      {
        next:(res:Course[])=>this.coursesData=res,
      }
    );
  }
}
