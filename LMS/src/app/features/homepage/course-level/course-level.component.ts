import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-course-level',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './course-level.component.html',
  styleUrl: './course-level.component.scss',
})
export class CourseLevelComponent {
  checked = false;
  categories = [
    { label: 'مبتدئ', value: 'beginner', checked: false },
    { label: 'متوسط', value: 'mid', checked: false },
    { label: 'متقدم', value: 'advanced', checked: false },
  ];
}
