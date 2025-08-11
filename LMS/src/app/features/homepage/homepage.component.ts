import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from './course-card/course-card.component';
import { SerachBarComponent } from './search-bar/serach-bar.component';
import { BannerComponent } from './banner/banner.component';
import { CourseCategoryComponent } from './course-category/course-category.component';
import { CourseLevelComponent } from './course-level/course-level.component';
import { Subject, of, startWith } from 'rxjs';
import {
  debounceTime,
  catchError,
  switchMap,
  distinctUntilChanged,
} from 'rxjs/operators';
import { CourseInstructorComponent } from './course-instructor/course-instructor.component';
import { HomePageService } from '../courses/services/home-page.service';
import { Course, CourseFilter } from '../courses/model/course.model';
import { ProfileRequiredService } from '../../shared/services/profile-required.service';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    CourseCardComponent,
    SerachBarComponent,
    BannerComponent,
    CourseCategoryComponent,
    CourseLevelComponent,
    CourseInstructorComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements OnInit, AfterViewInit {
  private homepageService = inject(HomePageService);
  private profileRequiredService = inject(ProfileRequiredService);
  private profileService = inject(ProfileService);

  // User name properties
  userFullName: string = '';
  userFirstName: string = '';
  userLastName: string = '';

  // All courses (main display)
  allCourses$ = this.homepageService.getAllCourses().pipe(
    catchError((error) => {
      console.error('Error fetching all courses from API:', error);
      return of([]); // Return empty array on error
    })
  );

  // Filtered courses (for search results)
  filteredCourses$ = this.homepageService.getFilteredCourses().pipe(
    catchError((error) => {
      console.error('Error fetching filtered courses from API:', error);
      return of([]); // Return empty array on error
    })
  );

  searchTerm = '';
  showFilters = false;
  selectedCategories: string[] = [];
  selectedLevels: string[] = [];
  selectedInstructors: string[] = [];
  private searchSubject = new Subject<string>();
  firstCategorySelected = false;

  @ViewChild('categorySection') categorySectionRef!: ElementRef;
  @ViewChild('searchSection') searchSectionRef!: ElementRef;

  constructor() {
    // Debug API endpoints on component initialization
    this.homepageService.debugApiEndpoints();
  }

  ngOnInit(): void {
    // Initialize with empty filters
    this.homepageService.updateFilters({});

    // Load user name from localStorage
    this.loadUserName();
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

  ngAfterViewInit() {
    this.searchSubject
      .pipe(
        debounceTime(1000), // Reduced debounce time
        distinctUntilChanged() // Prevent duplicate search terms
      )
      .subscribe((term) => {
        this.searchTerm = term;
        this.updateSearchFilter(term);
        if (this.searchSectionRef) {
          this.searchSectionRef.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
  }

  onSearchSectionChange(term: string) {
    this.searchSubject.next(term); // send value to subject
  }

  onCategoryChange(selected: string[]) {
    const hadNoSelectionBefore = this.selectedCategories.length === 0;
    this.selectedCategories = selected;

    // Update filters with selected categories
    this.updateCategoryFilter(selected);

    // Only scroll if the user added the *first* selection
    if (
      hadNoSelectionBefore &&
      selected.length > 0 &&
      !this.firstCategorySelected
    ) {
      this.firstCategorySelected = true;
      setTimeout(() => {
        if (this.categorySectionRef) {
          this.categorySectionRef.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }

    // Reset scroll flag if all unchecked
    if (selected.length === 0) {
      this.firstCategorySelected = false;
    }
  }

  onLevelChange(selected: string[]) {
    this.selectedLevels = selected;
    this.updateLevelFilter(selected);
  }

  onInstructorChange(selected: string[]) {
    this.selectedInstructors = selected;
    this.updateInstructorFilter(selected);
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

  // Update search filter
  private updateSearchFilter(searchTerm: string) {
    if (searchTerm.trim()) {
      this.homepageService.updateFilters({ search: searchTerm.trim() });
    } else {
      // Remove search filter if empty
      const currentFilters = this.homepageService['_currentFilters'].value;
      delete currentFilters.search;
      this.homepageService.updateFilters(currentFilters);
    }
  }

  // Update category filter
  private updateCategoryFilter(categories: string[]) {
    if (categories.length > 0) {
      this.homepageService.updateFilters({ category: categories });
    } else {
      // Remove category filter if empty
      const currentFilters = this.homepageService['_currentFilters'].value;
      delete currentFilters.category;
      this.homepageService.updateFilters(currentFilters);
    }
  }

  // Update level filter
  private updateLevelFilter(levels: string[]) {
    if (levels.length > 0) {
      this.homepageService.updateFilters({ level: levels });
    } else {
      // Remove level filter if empty
      const currentFilters = this.homepageService['_currentFilters'].value;
      delete currentFilters.level;
      this.homepageService.updateFilters(currentFilters);
    }
  }

  // Update instructor filter
  private updateInstructorFilter(instructors: string[]) {
    if (instructors.length > 0) {
      this.homepageService.updateFilters({ instructor: instructors });
    } else {
      // Remove instructor filter if empty
      const currentFilters = this.homepageService['_currentFilters'].value;
      delete currentFilters.instructor;
      this.homepageService.updateFilters(currentFilters);
    }
  }

  // Clear all filters
  clearAllFilters() {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedLevels = [];
    this.selectedInstructors = [];
    this.homepageService.updateFilters({});
  }
}
