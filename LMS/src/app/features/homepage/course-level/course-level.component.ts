import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() selectedLevelsChange = new EventEmitter<string[]>();

  checked = false;
  categories = [
    { label: 'مبتدئ', value: 'Beginner', checked: false },
    { label: 'متوسط', value: 'Intermediate', checked: false }, // Match API response exactly
    { label: 'متقدم', value: 'Advanced', checked: false },
  ];

  onCheckboxChange() {
    const selectedValues = this.categories
      .filter((cat) => cat.checked)
      .map((cat) => cat.value);

    this.selectedLevelsChange.emit(selectedValues);
  }

  /**
   * Clear all selected levels
   */
  clearSelection() {
    this.categories.forEach((cat) => (cat.checked = false));
    this.selectedLevelsChange.emit([]);
  }
}
