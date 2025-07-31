import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  @Input() course!: {
    id?: number;
    title: string;
    rating: number;
    level: string;
    lectures: number;
    img: string;
    instructor: any;
    path?: string;
    launchUrl?: string;
    description?: string;
  };

  getCourseLink(): string {
    // If course has an ID (from API), navigate to course details
    if (this.course.id) {
      return `/courses/${this.course.id}`;
    }
    // If course has a path (local course), navigate to course viewer
    if (this.course.path) {
      return `/course-viewer?folder=${this.course.path}`;
    }
    return '/courses';
  }

  getButtonText(): string {
    return this.course.id ? 'عرض التفاصيل' : 'بدء التعلم';
  }
}
