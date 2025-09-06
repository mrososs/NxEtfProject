import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Instructor } from '../../courses/model/instructor.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-instructor-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, RouterModule],
  templateUrl: './instructor-card.component.html',
  styleUrl: './instructor-card.component.scss',
})
export class InstructorCardComponent {
  @Input() instructor!: Instructor;
  private imageError = false;

  /**
   * Check if instructor has a valid image
   */
  hasValidImage(): boolean {
    if (this.imageError) return false;

    const imageUrl = this.getInstructorImage();
    return !!(
      imageUrl &&
      imageUrl.trim() !== '' &&
      imageUrl !== 'null' &&
      imageUrl !== 'undefined'
    );
  }

  /**
   * Get instructor image URL with fallback
   */
  getInstructorImage(): string {
    return this.instructor?.avatar || this.instructor?.img || '';
  }

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    console.log('Image failed to load:', event);
    this.imageError = true;
  }
}
