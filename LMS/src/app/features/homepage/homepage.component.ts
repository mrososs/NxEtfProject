import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseCardComponent } from './course-card/course-card.component';
import { SerachBarComponent } from './search-bar/serach-bar.component';
import { CourseCategoryComponent } from './course-category/course-category.component';
import { CourseLevelComponent } from './course-level/course-level.component';
import { CourseInstructorComponent } from './course-instructor/course-instructor.component';
import { Subject, of, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import {
  debounceTime,
  catchError,
  switchMap,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { HomePageService } from '../courses/services/home-page.service';
import { Course, CourseFilter } from '../courses/model/course.model';
import {
  EnrollmentService,
  Enrollment,
} from '../courses/services/enrollment.service';
import { ProfileRequiredService } from '../../shared/services/profile-required.service';
import { ProfileService } from '../profile/profile.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    CourseCardComponent,
    SerachBarComponent,
    CourseCategoryComponent,
    CourseLevelComponent,
    CourseInstructorComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements OnInit, AfterViewInit {
  private homepageService = inject(HomePageService);
  private enrollmentService = inject(EnrollmentService);
  private profileRequiredService = inject(ProfileRequiredService);
  private profileService = inject(ProfileService);
  private http = inject(HttpClient);

  // User name properties
  userFullName: string = '';
  userFirstName: string = '';
  userLastName: string = '';

  // All courses from API
  allCourses: Course[] = [];
  loading = true;
  error = false;

  // Search and filter properties
  searchTerm = '';
  selectedCategories: number[] = [];
  selectedLevels: string[] = [];
  selectedInstructors: string[] = [];
  showFilters = false;

  // Filter subjects
  private searchSubject$ = new BehaviorSubject<string>('');
  private categoriesSubject$ = new BehaviorSubject<number[]>([]);
  private levelsSubject$ = new BehaviorSubject<string[]>([]);
  private instructorsSubject$ = new BehaviorSubject<string[]>([]);

  // Filtered courses observable
  filteredCourses$: Observable<Course[]>;

  // Pagination
  pageSize = 6;
  currentPage = 1;
  totalPages = 1;
  totalCourses = 0;

  @ViewChild('categorySection') categorySectionRef!: ElementRef;
  @ViewChild('searchSection') searchSectionRef!: ElementRef;

  // Mobile filter components
  @ViewChild('categoryComponent') categoryComponent!: any;
  @ViewChild('levelComponent') levelComponent!: any;
  @ViewChild('instructorComponent') instructorComponent!: any;

  // Desktop sidebar filter components
  @ViewChild('categoryComponentSidebar') categoryComponentSidebar!: any;
  @ViewChild('levelComponentSidebar') levelComponentSidebar!: any;
  @ViewChild('instructorComponentSidebar') instructorComponentSidebar!: any;

  constructor(private router: Router) {
    // Setup filtered courses observable
    this.filteredCourses$ = combineLatest([
      this.searchSubject$.pipe(startWith('')),
      this.categoriesSubject$.pipe(startWith([])),
      this.levelsSubject$.pipe(startWith([])),
      this.instructorsSubject$.pipe(startWith([])),
    ]).pipe(
      map(([searchTerm, categories, levels, instructors]) => {
        const filtered = this.filterCourses(
          this.allCourses,
          searchTerm,
          categories,
          levels,
          instructors
        );

        // Update pagination info
        this.totalCourses = filtered.length;
        this.totalPages = Math.ceil(this.totalCourses / this.pageSize);

        // Reset to first page if current page exceeds total pages
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }

        return this.getPaginatedCourses(filtered);
      })
    );
  }

  ngOnInit(): void {
    // Load user name from localStorage
    this.loadUserName();

    // Load all courses from API
    this.loadAllCourses();
  }

  /**
   * Load user name from localStorage
   */
  private loadUserName(): void {
    this.userFullName = localStorage.getItem('userFullName') || '';
    this.userFirstName = localStorage.getItem('userFirstName') || '';
    this.userLastName = localStorage.getItem('userLastName') || '';

    // If no name in localStorage, try to get from profile service
    if (!this.userFullName) {
      this.loadUserNameFromProfile();
    }
  }

  /**
   * Load user name from profile service if not in localStorage
   */
  private loadUserNameFromProfile(): void {
    // Skip profile call if we're in 500 error mode
    if (this.profileService.isIn500ErrorMode()) {
      console.log('Skipping profile call due to 500 error mode');
      return;
    }

    // Use the cached profile service to get user name
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (profile && profile.firstName && profile.lastName) {
          const fullName = `${profile.firstName} ${profile.lastName}`.trim();
          this.userFullName = fullName;
          this.userFirstName = profile.firstName;
          this.userLastName = profile.lastName;
          console.log('User name loaded from profile service:', fullName);
        }
      },
      error: (error) => {
        console.log('No user name found in localStorage or profile service');
      },
    });
  }

  /**
   * Refresh user name from localStorage
   * This method can be called when profile is updated
   */
  public refreshUserName(): void {
    this.loadUserName();
  }

  /**
   * Refresh user name from profile service
   * This method can be called when profile is updated
   */
  public refreshUserNameFromProfile(): void {
    this.profileService.refreshProfile().subscribe({
      next: (profile) => {
        if (profile && profile.firstName && profile.lastName) {
          const fullName = `${profile.firstName} ${profile.lastName}`.trim();
          this.userFullName = fullName;
          this.userFirstName = profile.firstName;
          this.userLastName = profile.lastName;
          console.log('User name refreshed from profile service:', fullName);
        }
      },
      error: (error) => {
        console.error('Error refreshing user name:', error);
      },
    });
  }

  /**
   * Load all courses from API
   */
  loadAllCourses(): void {
    this.loading = true;
    this.error = false;

    const apiUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar';

    this.http
      .get<{
        data: Course[];
        count: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
      }>(apiUrl)
      .subscribe({
        next: (response) => {
          this.allCourses = response.data || [];
          this.loading = false;
          console.log('All courses loaded:', this.allCourses);
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.error = true;
          this.loading = false;
          this.allCourses = [];
        },
      });
  }

  /**
   * Filter courses based on search term, categories, levels, and instructors
   */
  private filterCourses(
    courses: Course[],
    searchTerm: string,
    categories: number[],
    levels: string[],
    instructors: string[]
  ): Course[] {
    if (!courses || courses.length === 0) {
      return [];
    }

    return courses.filter((course) => {
      // Search filter
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        const titleMatch = course.title.toLowerCase().includes(searchLower);
        const descriptionMatch = course.description
          ?.toLowerCase()
          .includes(searchLower);
        const trainerMatch = course.trainerName
          ?.toLowerCase()
          .includes(searchLower);

        if (!titleMatch && !descriptionMatch && !trainerMatch) {
          return false;
        }
      }

      // Category filter
      if (categories && categories.length > 0) {
        // This would be implemented when we have category API integration
        // For now, we'll skip category filtering
      }

      // Level filter
      if (levels && levels.length > 0) {
        if (
          !course.courseLevel ||
          !levels.includes(course.courseLevel.toLowerCase())
        ) {
          return false;
        }
      }

      // Instructor filter
      if (instructors && instructors.length > 0) {
        if (!course.trainerName) {
          return false;
        }

        const trainerMatch = instructors.some((instructor) =>
          course.trainerName?.toLowerCase().includes(instructor.toLowerCase())
        );

        if (!trainerMatch) {
          return false;
        }
      }

      return true;
    });
  }

  ngAfterViewInit() {
    // AfterViewInit implementation for future use
  }

  onSearchSectionChange(term: string) {
    this.searchTerm = term;
    this.currentPage = 1; // Reset to first page when searching
    this.searchSubject$.next(term);
  }

  onCategoryChange(selected: number[]) {
    this.selectedCategories = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.categoriesSubject$.next(selected);
    console.log('Category filter changed:', selected);
  }

  onSelectedCoursesChange(selectedCourses: any[]) {
    // This method is called by course-category component
    console.log('Selected courses from categories:', selectedCourses);
  }

  onLevelChange(selected: string[]) {
    this.selectedLevels = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.levelsSubject$.next(selected);
    console.log('Level filter changed:', selected);
  }

  onInstructorChange(selected: string[]) {
    this.selectedInstructors = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.instructorsSubject$.next(selected);
    console.log('Instructor filter changed:', selected);
  }

  // Check profile before accessing protected features
  checkProfileBeforeAction(action: () => void): void {
    this.profileRequiredService
      .checkProfileAndShowDialog()
      .subscribe((hasProfile) => {
        if (hasProfile) {
          action();
        }
      });
  }

  // Protected actions that require profile
  onCourseClick(courseId: number): void {
    this.checkProfileBeforeAction(() => {
      console.log('Navigating to course:', courseId);
      // Navigate to course details
    });
  }

  onInstructorClick(instructorId: number): void {
    this.checkProfileBeforeAction(() => {
      console.log('Navigating to instructor:', instructorId);
      // Navigate to instructor details
    });
  }

  // Clear all filters
  clearAllFilters() {
    // Reset all filter values
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedLevels = [];
    this.selectedInstructors = [];
    this.currentPage = 1; // Reset to first page

    // Clear UI component selections first
    this.clearComponentSelections();

    // Update subjects after a small delay to ensure UI updates
    setTimeout(() => {
      this.updateFilterSubjects();
    }, 50);
  }

  /**
   * Clear selections in all filter components (both mobile and desktop)
   */
  private clearComponentSelections(): void {
    // Clear mobile filter components
    if (this.categoryComponent) {
      this.categoryComponent.clearSelection();
    }
    if (this.levelComponent) {
      this.levelComponent.clearSelection();
    }
    if (this.instructorComponent) {
      this.instructorComponent.clearSelection();
    }

    // Clear desktop sidebar filter components
    if (this.categoryComponentSidebar) {
      this.categoryComponentSidebar.clearSelection();
    }
    if (this.levelComponentSidebar) {
      this.levelComponentSidebar.clearSelection();
    }
    if (this.instructorComponentSidebar) {
      this.instructorComponentSidebar.clearSelection();
    }
  }

  /**
   * Update all filter subjects
   */
  private updateFilterSubjects(): void {
    this.searchSubject$.next(this.searchTerm);
    this.categoriesSubject$.next(this.selectedCategories);
    this.levelsSubject$.next(this.selectedLevels);
    this.instructorsSubject$.next(this.selectedInstructors);
  }

  /**
   * Get paginated courses
   */
  getPaginatedCourses(courses: Course[]): Course[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return courses.slice(startIndex, endIndex);
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.refreshPagination();
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.refreshPagination();
    }
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.refreshPagination();
    }
  }

  /**
   * Navigate to first page
   */
  goToFirstPage(): void {
    this.currentPage = 1;
    this.refreshPagination();
  }

  /**
   * Navigate to last page
   */
  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.refreshPagination();
  }

  /**
   * Refresh pagination after page change
   */
  private refreshPagination(): void {
    // Trigger a refresh of the filtered courses observable
    this.searchSubject$.next(this.searchTerm);
  }

  /**
   * Get page numbers for pagination display
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Check if previous page is available
   */
  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  /**
   * Check if next page is available
   */
  hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  /**
   * Get pagination info text
   */
  getPaginationInfo(): string {
    if (this.totalCourses === 0) {
      return 'لا توجد دورات';
    }

    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(
      this.currentPage * this.pageSize,
      this.totalCourses
    );

    return `عرض ${startItem}-${endItem} من ${this.totalCourses} دورة`;
  }

  /**
   * Navigate to course details page
   */
  launchCourse(courseId: number): void {
    if (courseId) {
      // Navigate to course details page
      this.router.navigate(['/courses', courseId]);
    } else {
      console.warn('No course ID available for navigation');
    }
  }

  /**
   * Check if user is enrolled in a specific course
   */
  isEnrolledInCourse(courseId: number): boolean {
    return this.enrollmentService.isEnrolledInCourse(courseId);
  }
}
