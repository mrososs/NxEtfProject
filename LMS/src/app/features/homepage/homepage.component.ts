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
import { Subject } from 'rxjs';
import { HomePageService } from '../courses/services/home-page.service';
import { Course } from '../courses/model/course.model';
import { EnrollmentService } from '../courses/services/enrollment.service';
import { ProfileRequiredService } from '../../shared/services/profile-required.service';
import { ProfileService } from '../profile/profile.service';
import {
  SearchService,
  SearchResult,
} from '../courses/services/search.service';
import { PaginatorModule } from 'primeng/paginator';

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
    PaginatorModule,
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

  private destroy$ = new Subject<void>();

  // Pagination
  pageSize = 10;
  currentPage = 1;
  first = 0; // Paginator zero-based index
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

  constructor(private router: Router) {}

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

        console.log('Search Result:', {
          courses: this.allCourses.length,
          total: this.totalCourses,
          page: this.currentPage,
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
        }
      },
      error: () => {},
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
  }

  onSearchSectionChange(term: string) {
    this.searchTerm = term;
    this.currentPage = 1; // Reset to first page when searching
    this.first = 0; // Reset paginator

    // Show loading state immediately for better UX
    if (term && term.trim()) {
      this.loading = true;
    }

    // Perform search immediately since search-bar already has debounce
    this.performSearch(term);
  }

  onCategoryChange(selected: number[]) {
    this.selectedCategories = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.first = 0; // Reset paginator
    this.performSearch(this.searchTerm); // Reload with new filter
  }

  onSelectedCoursesChange(selectedCourses: Course[]) {
    // This method is called by course-category component
  }

  onLevelChange(selected: string[]) {
    this.selectedLevels = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.first = 0; // Reset paginator
    this.performSearch(this.searchTerm); // Reload with new filter
  }

  onInstructorChange(selected: string[]) {
    this.selectedInstructors = selected;
    this.currentPage = 1; // Reset to first page when filtering
    this.first = 0; // Reset paginator
    this.performSearch(this.searchTerm); // Reload with new filter
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.currentPage = event.page + 1;
    this.pageSize = event.rows;
    this.performSearch(this.searchTerm);

    // Scroll to top of course list
    window.scrollTo({ top: 300, behavior: 'smooth' });
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
      // Navigate to course details
    });
  }

  onInstructorClick(instructorId: number): void {
    this.checkProfileBeforeAction(() => {
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
    this.first = 0; // Reset paginator

    // Clear UI component selections first
    this.clearComponentSelections();

    // Clear search cache
    this.searchService.clearCache();

    // Reload all courses
    this.performSearch('');
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
   * Navigate to course details page
   */
  launchCourse(courseId: number): void {
    if (courseId) {
      // Navigate to course details page
      this.router.navigate(['/courses', courseId]);
    } else {
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
  }
}
