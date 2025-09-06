import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../model/category.model';

@Component({
  selector: 'app-selected-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-courses.component.html',
  styleUrl: './selected-courses.component.scss',
})
export class SelectedCoursesComponent implements OnInit, OnChanges {
  @Input() selectedCourses: Category[] = [];

  groupedCourses: { [categoryId: number]: Category[] } = {};

  ngOnInit(): void {
    this.groupCoursesByCategory();
  }

  ngOnChanges(): void {
    this.groupCoursesByCategory();
  }

  private groupCoursesByCategory(): void {
    this.groupedCourses = {};

    this.selectedCourses.forEach((course) => {
      if (!this.groupedCourses[course.categoryId]) {
        this.groupedCourses[course.categoryId] = [];
      }
      this.groupedCourses[course.categoryId].push(course);
    });
  }

  getCategoryLabel(categoryId: number): string {
    // Use generic label based on category ID
    // In the future, this should get the actual category name from the parent component
    return `فئة ${categoryId}`;
  }

  getCourseLabel(course: Category): string {
    // Use course name from API if available, otherwise use courseId
    if (course.course && course.course.trim() !== '') {
      return course.course;
    }
    return `كورس ${course.courseId}`;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
