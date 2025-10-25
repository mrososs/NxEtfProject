import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CourseCardComponent } from './course-card/course-card.component';
import { SerachBarComponent } from './search-bar/serach-bar.component';
import { CourseCategoryComponent } from './course-category/course-category.component';
import { CourseLevelComponent } from './course-level/course-level.component';
import { CourseInstructorComponent } from './course-instructor/course-instructor.component';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HomePageService } from '../courses/services/home-page.service';
import { Course } from '../courses/model/course.model';
import { EnrollmentService } from '../courses/services/enrollment.service';
import { ProfileRequiredService } from '../../shared/services/profile-required.service';
import { ProfileService } from '../profile/profile.service';
import {
  SearchService,
  SearchResult,
} from '../courses/services/search.service';

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
export class HomepageComponent implements OnInit, AfterViewInit, OnDestroy {
  private homepageService = inject(HomePageService);
  private enrollmentService = inject(EnrollmentService);
  private profileRequiredService = inject(ProfileRequiredService);
  private profileService = inject(ProfileService);
  private searchService = inject(SearchService);

  // User name properties
  userFullName = '';
  userFirstName = '';
  userLastName = '';

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

  private destroy$ = new Subject<void>();

  // Filtered courses observable
  filteredCourses$: Observable<Course[]>;

  // Pagination
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  totalCourses = 0;

  @ViewChild('categorySection') categorySectionRef!: ElementRef;
  @ViewChild('searchSection') searchSectionRef!: ElementRef;

  // Mobile filter components
  @ViewChild('categoryComponent') categoryComponent!: CourseCategoryComponent;
  @ViewChild('levelComponent') levelComponent!: CourseLevelComponent;
  @ViewChild('instructorComponent')
  instructorComponent!: CourseInstructorComponent;

  // Desktop sidebar filter components
  @ViewChild('categoryComponentSidebar')
  categoryComponentSidebar!: CourseCategoryComponent;
  @ViewChild('levelComponentSidebar')
  levelComponentSidebar!: CourseLevelComponent;
  @ViewChild('instructorComponentSidebar')
  instructorComponentSidebar!: CourseInstructorComponent;

  constructor(private router: Router) {
    // Setup filtered courses observable - now just returns the current courses
    this.filteredCourses$ = combineLatest([
      this.searchSubject$.pipe(startWith('')),
      this.categoriesSubject$.pipe(startWith([])),
      this.levelsSubject$.pipe(startWith([])),
      this.instructorsSubject$.pipe(startWith([])),
    ]).pipe(
      map(() => {
        // Simply return the current courses from API
        return this.allCourses;
      })
    );

    // Search is now handled directly in onSearchSectionChange
  }

  ngOnInit(): void {
    // Load user name from localStorage
    this.loadUserName();

    // Load all courses using search service
    this.loadAllCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Perform search using search service
   */
  private performSearch(searchTerm: string): void {
    this.loading = true;
    this.error = false;

    const searchParams = {
      searchTerm: searchTerm.trim(),
      page: this.currentPage,
      pageSize: this.pageSize,
      lang: 'ar',
      categories: this.selectedCategories,
      levels: this.selectedLevels,
      instructors: this.selectedInstructors,
    };

    this.searchService.searchCourses(searchParams).subscribe({
      next: (result: SearchResult) => {
        this.allCourses = result.courses;
        this.totalCourses = result.totalCourses;
        this.totalPages = result.totalPages;
        this.currentPage = result.currentPage;
        this.loading = false;

        console.log('Search completed:', {
          searchTerm,
          resultsCount: result.courses.length,
          totalCourses: result.totalCourses,
          currentPage: result.currentPage,
        });
      },
      error: (error) => {
        console.error('Search error:', error);
        this.error = true;
        this.loading = false;
        this.allCourses = [];
      },
    });
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
      error: () => {
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
   * Load all courses using search service
   */
  loadAllCourses(): void {
    this.loading = true;
    this.error = false;

    this.searchService
      .getAllCourses(
        this.currentPage,
        this.pageSize,
        this.selectedCategories,
        this.selectedLevels,
        this.selectedInstructors
      )
      .subscribe({
        next: (result: SearchResult) => {
          this.allCourses = result.courses;
          this.totalCourses = result.totalCourses;
          this.totalPages = result.totalPages;
          this.currentPage = result.currentPage;
          this.loading = false;

          console.log('All courses loaded:', {
            resultsCount: result.courses.length,
            totalCourses: result.totalCourses,
            currentPage: result.currentPage,
          });
        },
        error: (error) => {
          console.error('Error loading all courses:', error);
          this.error = true;
          this.loading = false;
          this.allCourses = [];
        },
      });
  }

  ngAfterViewInit() {
    // View initialization complete
    console.log('View initialized');
  }

  onSearchSectionChange(term: string) {
    this.searchTerm = term;
    this.currentPage = 1; // Reset to first page when searching

    // Show loading state immediately for better UX
    if (term && term.trim()) {
      this.loading = true;
    }

    // Perform search immediately since search-bar already has debounce
    this.performSearch(term);
    this.searchSubject$.next(term);
  }

  onCategoryChange(selected: number[]) {
    this.selectedCategories = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.performSearch(this.searchTerm); // Reload with new filter
    this.categoriesSubject$.next(selected);
    console.log('Category filter changed:', selected);
  }

  onSelectedCoursesChange(selectedCourses: Course[]) {
    // This method is called by course-category component
    console.log('Selected courses from categories:', selectedCourses);
  }

  onLevelChange(selected: string[]) {
    this.selectedLevels = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.performSearch(this.searchTerm); // Reload with new filter
    this.levelsSubject$.next(selected);
    console.log('Level filter changed:', selected);
  }

  onInstructorChange(selected: string[]) {
    this.selectedInstructors = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.performSearch(this.searchTerm); // Reload with new filter
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

    // Clear search cache
    this.searchService.clearCache();

    // Reload all courses
    this.performSearch('');

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
      this.performSearch(this.searchTerm);
    }
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.performSearch(this.searchTerm);
    }
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.performSearch(this.searchTerm);
    }
  }

  /**
   * Navigate to first page
   */
  goToFirstPage(): void {
    this.currentPage = 1;
    this.performSearch(this.searchTerm);
  }

  /**
   * Navigate to last page
   */
  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.performSearch(this.searchTerm);
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

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    return this.searchService.getCacheStats();
  }

  /**
   * Clear search cache (for debugging)
   */
  clearSearchCache() {
    this.searchService.clearCache();
    console.log('Search cache cleared');
  }
}
