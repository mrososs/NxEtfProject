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
    title: string;
    rating: number; // ✅ التعديل هنا
    level: string;
    lectures: number;
    img: string;
    instructor: any; // لأنك في الداتا حاطط object مش مجرد string
    path?: string;
  };
}
