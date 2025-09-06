import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { CategoryNamesService } from '../services/category-names.service';
import { Category } from '../model/category.model';

interface CategoryDisplay {
  id: number;
  label: string;
  checked: boolean;
  courseCount: number;
}

@Component({
  selector: 'app-course-category',
  standalone: true,
  imports: [CommonModule, CheckboxModule, FormsModule],
  templateUrl: './course-category.component.html',
  styleUrl: './course-category.component.scss',
})
export class CourseCategoryComponent implements OnInit {
  @Output() selectedCategoriesChange = new EventEmitter<number[]>();
  @Output() selectedCoursesChange = new EventEmitter<Category[]>();

  private categoryService = inject(CategoryService);
  private categoryNamesService = inject(CategoryNamesService);

  categories: CategoryDisplay[] = [];
  allCategories: Category[] = [];
  categoryNames: { [key: number]: string } = {};
  categoryCounts: { [key: number]: number } = {};
  loading = true;

  ngOnInit(): void {
    this.loadCategoryNames();
    this.loadCategories();
    this.loadCoursesCount();
  }

  loadCategoryNames(): void {
    // Get from dedicated categories API
    this.categoryService.getCategoryNames().subscribe({
      next: (names) => {
        this.categoryNames = names;
        console.log('Category names loaded from /api/Categories:', names);
      },
      error: (error) => {
        console.error('Error loading category names:', error);
        this.categoryNames = {};
      },
    });
  }

  private loadCategoryNamesFromCourses(): void {
    this.categoryNamesService.getCategoryNamesFromCourses().subscribe({
      next: (names) => {
        this.categoryNames = names;
        console.log('Category names loaded from courses API:', names);

        // Log which names came from API vs generic
        Object.entries(names).forEach(([id, name]) => {
          if (name.startsWith('فئة ')) {
            console.log(
              `Category ${id}: Using generic name "${name}" (API returned null)`
            );
          } else {
            console.log(`Category ${id}: Using API name "${name}"`);
          }
        });
      },
      error: (error) => {
        console.error('Error loading category names from courses:', error);
        // Final fallback: empty object (will use generic names)
        this.categoryNames = {};
      },
    });
  }

  loadCoursesCount(): void {
    // Get courses count by category from the courses API
    this.categoryService.getCoursesCountByCategory().subscribe({
      next: (counts) => {
        this.categoryCounts = counts;
        console.log(
          'Courses count loaded from /api/Course/categories:',
          counts
        );
      },
      error: (error) => {
        console.error('Error loading courses count:', error);
        this.categoryCounts = {};
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.processCategories();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      },
    });
  }

  private processCategories(): void {
    // Get unique category IDs from the courses
    const uniqueCategoryIds = [
      ...new Set(this.allCategories.map((cat) => cat.categoryId)),
    ];

    // Create categories display using data from both APIs
    this.categories = uniqueCategoryIds.map((categoryId) => ({
      id: categoryId,
      label: this.getCategoryLabel(categoryId),
      checked: false,
      courseCount: this.categoryCounts[categoryId] || 0,
    }));

    console.log('Processed categories:', this.categories);
  }

  private getCategoryLabel(categoryId: number): string {
    // Use the category names from /api/Categories
    const name = this.categoryNames[categoryId] || `فئة ${categoryId}`;

    // Log the source of the name for debugging
    if (this.categoryNames[categoryId]) {
      console.log(
        `Category ${categoryId}: Using name from /api/Categories: "${name}"`
      );
    } else {
      console.log(
        `Category ${categoryId}: No name from /api/Categories, using fallback "${name}"`
      );
    }

    return name;
  }

  onCheckboxChange(): void {
    const selectedCategoryIds = this.categories
      .filter((cat) => cat.checked)
      .map((cat) => cat.id);

    // Emit selected category IDs
    this.selectedCategoriesChange.emit(selectedCategoryIds);

    // Get and emit courses for selected categories
    if (selectedCategoryIds.length > 0) {
      const selectedCourses = this.allCategories.filter((cat) =>
        selectedCategoryIds.includes(cat.categoryId)
      );
      this.selectedCoursesChange.emit(selectedCourses);
    } else {
      this.selectedCoursesChange.emit([]);
    }
  }
}
