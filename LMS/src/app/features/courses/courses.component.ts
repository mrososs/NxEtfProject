import { DreamsComponent } from './dreams/dreams.component';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBannerComponent } from './top-banner/top-banner.component';
import { LogoBannerComponent } from './logo-banner/logo-banner.component';
import { TypesComponent } from './types/types.component';
import { TrainingCourseComponent } from './Training-course/Training-course.component';
import { InstructorsComponent } from './instructors/instructors.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    TopBannerComponent,
    DreamsComponent,
    LogoBannerComponent,
    TypesComponent,
    TrainingCourseComponent,
    InstructorsComponent,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent {}
