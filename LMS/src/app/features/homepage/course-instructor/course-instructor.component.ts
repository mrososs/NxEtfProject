import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { HomePageService } from '../../courses/services/home-page.service';
import { Instructor } from '../../courses/model/instructor.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-course-instructor',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './course-instructor.component.html',
  styleUrl: './course-instructor.component.scss',
})
export class CourseInstructorComponent implements OnInit {
  @Output() selectedInstructorsChange = new EventEmitter<string[]>();

  private _homePageService = inject(HomePageService);

  checked = false;
  categories: { label: string; value: string; checked: boolean }[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadTopInstructors();
  }

  private loadTopInstructors(): void {
    this.loading = true;
    this.error = false;

    // Get first 3 top-rated instructors from API with proper error handling
    this._homePageService
      .getInstructorsFromApi({
        page: 1,
        pageSize: 3,
        sortBy: 'Id',
        sortDir: 'desc',
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching top instructors from API:', error);
          this.error = true;
          this.loading = false;
          // Fallback to local data
          return this._homePageService.getInstructors();
        })
      )
      .subscribe({
        next: (instructors: Instructor[]) => {
          this.categories = instructors.map((instructor) => ({
            label: instructor.name,
            value: `id:${instructor.id}`,
            checked: false,
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('Error in instructor subscription:', err);
          this.error = true;
          this.loading = false;
          // Set default categories if both API and local data fail
          this.categories = [
            { label: 'احمد ياسر', value: 'id:1', checked: false },
            { label: 'الاء هاني', value: 'id:2', checked: false },
            { label: 'حسام ابراهيم', value: 'id:3', checked: false },
          ];
        },
      });
  }

  onCheckboxChange() {
    const selectedValues = this.categories
      .filter((cat) => cat.checked)
      .map((cat) => cat.value);

    this.selectedInstructorsChange.emit(selectedValues);
  }
}
