import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-category',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './course-category.component.html',
  styleUrl: './course-category.component.scss',
})
export class CourseCategoryComponent {
  @Output() selectedCategoriesChange = new EventEmitter<string[]>();

  checked = false;
  categories = [
    { label: 'دورات الإرشاد السياحي', value: 'guiding', checked: false },
    { label: 'دورات إدارة الفنادق', value: 'hotels', checked: false },
    { label: 'دورات السياحة', value: 'tourism', checked: false },
    { label: 'دورات الضيافة', value: 'hospitality', checked: false },
    { label: 'دورات الطيران والسفر', value: 'aviation', checked: false },
    { label: 'دورات الدعم والمهارات', value: 'support', checked: false },
    { label: 'دورات تقنية', value: 'tech', checked: false },
  ];
 onCheckboxChange() {
  const selectedLabels = this.categories
    .filter(cat => cat.checked)
    .map(cat => cat.label);

  this.selectedCategoriesChange.emit(selectedLabels);
}

}
