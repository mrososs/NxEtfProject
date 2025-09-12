import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RouterModule } from '@angular/router';
import { Course } from '../../courses/model/course.model';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface CourseLevelConfig {
  label: string;
  class: string;
  color: string;
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  @Input() course!: Course;

  private readonly levelConfig: { [key: string]: CourseLevelConfig } = {
    [CourseLevel.BEGINNER]: {
      label: 'مبتدئ',
      class: 'badge-success',
      color: '#28a745',
    },
    [CourseLevel.INTERMEDIATE]: {
      label: 'متوسط',
      class: 'badge-warning',
      color: '#ffc107',
    },
    [CourseLevel.ADVANCED]: {
      label: 'متقدم',
      class: 'badge-danger',
      color: '#dc3545',
    },
  };

  getCourseLink(): string {
    return `/courses/${this.course.id}`;
  }

  getButtonText(): string {
    return 'عرض التفاصيل';
  }

  /**
   * Get course level in Arabic
   */
  getCourseLevel(): string {
    if (!this.course.courseLevel || this.course.courseLevel.trim() === '') {
      return 'غير محدد';
    }

    const level = this.course.courseLevel.toLowerCase();
    const config = this.levelConfig[level];
    return config ? config.label : this.course.courseLevel;
  }

  /**
   * Get course level badge class
   */
  getCourseLevelClass(): string {
    if (!this.course.courseLevel || this.course.courseLevel.trim() === '') {
      return 'badge-secondary';
    }

    const level = this.course.courseLevel.toLowerCase();
    const config = this.levelConfig[level];
    return config ? config.class : 'badge-secondary';
  }

  /**
   * Get course level badge color
   */
  getCourseLevelColor(): string {
    if (!this.course.courseLevel || this.course.courseLevel.trim() === '') {
      return '#6c757d';
    }

    const level = this.course.courseLevel.toLowerCase();
    const config = this.levelConfig[level];
    return config ? config.color : '#6c757d';
  }

  /**
   * Get trainer name or default text
   */
  getTrainerName(): string {
    return this.course.trainerName || 'لم يتم تحديد المدرب';
  }

  /**
   * Get course rating display
   */
  getCourseRating(): string {
    if (!this.course.reviews || this.course.reviews.length === 0) {
      return 'لا يوجد تقييم حالياً';
    }

    // Calculate average rating from reviews
    const totalRating = this.course.reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    const averageRating = totalRating / this.course.reviews.length;
    return `${averageRating.toFixed(1)} (${this.course.reviews.length} تقييم)`;
  }

  /**
   * Get course image
   */
  getCourseImage(): string {
    return this.course.img || '../../../../assets/img/homePagecourse.png';
  }

  /**
   * Get star rating for display
   */
  getStarRating(): number {
    if (!this.course.reviews || this.course.reviews.length === 0) {
      return 0;
    }

    const totalRating = this.course.reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    return totalRating / this.course.reviews.length;
  }
}
