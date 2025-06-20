import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-course-instructor',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './course-instructor.component.html',
  styleUrl: './course-instructor.component.scss',
})
export class CourseInstructorComponent {
  checked = false;
  categories = [
    { label: 'احمد ياسر', value: 'id:1', checked: false },
    { label: 'الاء هاني', value: 'hotels', checked: false },
    { label: 'حسام ابراهيم', value: 'tourism', checked: false },
    { label: 'محمود عماد', value: 'hospitality', checked: false },
    { label: 'مريم علاء', value: 'aviation', checked: false },
    { label: 'محمد محمدين', value: 'support', checked: false },
  ];
}
