import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Course } from '../model/course.model';

export interface SearchParams {
  searchTerm: string;
  page?: number;
  pageSize?: number;
  lang?: string;
  categories?: number[];
  levels?: string[];
  instructors?: string[];
}

export interface SearchResult {
  courses: Course[];
  totalCourses: number;
  totalPages: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private http = inject(HttpClient);

  // Base API URL
  private readonly baseUrl =
    'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course';

  // Cache for search results
  private searchCache = new Map<string, SearchResult>();
  private allCoursesCache: Course[] | null = null;
  private allCoursesCacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if text contains Arabic characters
   */
  private isArabicText(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  }

  /**
   * Find course ID by Arabic title from cached courses
   */
  private findCourseIdByArabicTitle(
    arabicTitle: string,
    courses: Course[]
  ): number | null {
    const searchTerm = arabicTitle.toLowerCase().trim();

    const course = courses.find((c) => {
      const titleMatch = c.title?.toLowerCase().includes(searchTerm);
      const titleArMatch = c.titleAr?.toLowerCase().includes(searchTerm);
      const titleEnMatch = c.titleEn?.toLowerCase().includes(searchTerm);

      if (titleMatch || titleArMatch || titleEnMatch) {
        return true;
      }
      return false;
    });

    return course ? course.id : null;
  }

  /**
   * Build API URL with parameters
   */
  private buildApiUrl(params: {
    lang: string;
    page: number;
    pageSize: number;
    filter?: string;
    categories?: number[];
    levels?: string[];
    instructors?: string[];
  }): string {
    let url = `${this.baseUrl}?lang=${params.lang}&page=${params.page}&pageSize=${params.pageSize}&sortBy=Id&sortDir=desc`;

    if (params.filter) {
      url += `&filter=${encodeURIComponent(params.filter)}`;
    }

    // Note: API doesn't support advanced filtering, so we'll filter on client-side
    // The categories, levels, and instructors will be handled in the filtering logic

    return url;
  }

  /**
   * Load courses from API with both Arabic and English
   */
  private loadCoursesFromApi(params: {
    lang: string;
    page: number;
    pageSize: number;
    filter?: string;
    categories?: number[];
    levels?: string[];
    instructors?: string[];
  }): Observable<SearchResult> {
    const apiUrlAr = this.buildApiUrl({ ...params, lang: 'ar' });
    const apiUrlEn = this.buildApiUrl({ ...params, lang: 'en' });

    const arabicCourses$ = this.http.get<{
      data: Course[];
      count: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(apiUrlAr);

    const englishCourses$ = this.http.get<{
      data: Course[];
      count: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(apiUrlEn);

    return combineLatest([arabicCourses$, englishCourses$]).pipe(
      map(([arabicResponse, englishResponse]) => {
        const arabicCourses = arabicResponse.data || [];
        const englishCourses = englishResponse.data || [];

        // Merge courses by ID, keeping Arabic as primary and adding English title
        const mergedCourses = this.mergeCoursesWithBothLanguages(
          arabicCourses,
          englishCourses
        );

        // Apply client-side filtering
        const filteredCourses = this.applyClientSideFilters(
          mergedCourses,
          params.categories,
          params.levels,
          params.instructors
        );

        return {
          courses: filteredCourses,
          totalCourses: filteredCourses.length,
          totalPages: Math.ceil(filteredCourses.length / params.pageSize),
          currentPage: params.page,
        };
      }),
      catchError((error) => {
        console.error('Error loading courses from API:', error);
        return of({
          courses: [],
          totalCourses: 0,
          totalPages: 1,
          currentPage: params.page,
        });
      })
    );
  }

  /**
   * Merge Arabic and English courses by ID
   */
  private mergeCoursesWithBothLanguages(
    arabicCourses: Course[],
    englishCourses: Course[]
  ): Course[] {
    const mergedCourses: Course[] = [];

    // Create a map of English courses by ID for quick lookup
    const englishCoursesMap = new Map<number, Course>();
    englishCourses.forEach((course) => {
      englishCoursesMap.set(course.id, course);
    });

    // Process Arabic courses and add English titles
    arabicCourses.forEach((arabicCourse) => {
      const englishCourse = englishCoursesMap.get(arabicCourse.id);

      // Create a new course object with both titles
      const mergedCourse: Course = {
        ...arabicCourse,
        titleAr: arabicCourse.title, // Keep Arabic title
        titleEn: englishCourse?.title || '', // Add English title
      };

      mergedCourses.push(mergedCourse);
    });

    return mergedCourses;
  }

  /**
   * Apply client-side filtering to courses
   */
  private applyClientSideFilters(
    courses: Course[],
    categories?: number[],
    levels?: string[],
    instructors?: string[]
  ): Course[] {
    if (!courses || courses.length === 0) {
      return [];
    }

    return courses.filter((course) => {
      // Category filter
      if (categories && categories.length > 0) {
        // Only filter by categories if the course has categories
        if (course.categories && course.categories.length > 0) {
          const hasMatchingCategory = categories.some((categoryId) =>
            course.categories?.includes(categoryId.toString())
          );
          if (!hasMatchingCategory) {
            return false;
          }
        } else {
          // If course has no categories, exclude it from category-filtered results
          return false;
        }
      }

      // Level filter
      if (levels && levels.length > 0) {
        // Check if course has a valid level (not empty, null, or undefined)
        if (course.courseLevel && course.courseLevel.trim() !== '') {
          const hasMatchingLevel = levels.some(
            (level) => course.courseLevel?.toLowerCase() === level.toLowerCase()
          );
          if (!hasMatchingLevel) {
            return false;
          }
        } else {
          // If course has no level, empty level, or null/undefined, exclude it from level-filtered results
          return false;
        }
      }

      // Instructor filter
      if (instructors && instructors.length > 0) {
        if (!course.trainerName) {
          return false;
        }
        const hasMatchingInstructor = instructors.some((instructor) =>
          course.trainerName?.toLowerCase().includes(instructor.toLowerCase())
        );
        if (!hasMatchingInstructor) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get cache key for search
   */
  private getCacheKey(params: SearchParams): string {
    const categoriesKey = params.categories
      ? params.categories.sort().join(',')
      : '';
    const levelsKey = params.levels ? params.levels.sort().join(',') : '';
    const instructorsKey = params.instructors
      ? params.instructors.sort().join(',')
      : '';
    return `${params.searchTerm}-${params.page}-${params.pageSize}-${params.lang}-${categoriesKey}-${levelsKey}-${instructorsKey}`;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Search courses with smart caching and Arabic/English handling
   */
  searchCourses(params: SearchParams): Observable<SearchResult> {
    const {
      searchTerm,
      page = 1,
      pageSize = 10,
      lang = 'ar',
      categories,
      levels,
      instructors,
    } = params;

    // Check cache first
    const cacheKey = this.getCacheKey(params);
    const cachedResult = this.searchCache.get(cacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // Handle empty search term - return all courses
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getAllCourses(
        page,
        pageSize,
        categories,
        levels,
        instructors
      );
    }

    // Check if search term contains Arabic characters
    if (this.isArabicText(searchTerm)) {
      // For Arabic text, first try to find course ID from cached courses
      if (
        this.allCoursesCache &&
        this.isCacheValid(this.allCoursesCacheTimestamp)
      ) {
        const courseId = this.findCourseIdByArabicTitle(
          searchTerm,
          this.allCoursesCache
        );
        if (courseId) {
          return this.searchCoursesById(
            courseId,
            page,
            pageSize,
            categories,
            levels,
            instructors
          );
        }
      } else {
        // Load all courses first to get the cache, then search
        return this.getAllCourses(
          1,
          1000,
          categories,
          levels,
          instructors
        ).pipe(
          switchMap(() => {
            // After loading all courses, try to find the course ID
            if (this.allCoursesCache) {
              const courseId = this.findCourseIdByArabicTitle(
                searchTerm,
                this.allCoursesCache
              );
              if (courseId) {
                return this.searchCoursesById(
                  courseId,
                  page,
                  pageSize,
                  categories,
                  levels,
                  instructors
                );
              }
            }
            // Fallback to title search
            return this.searchCoursesByTitle(
              searchTerm,
              page,
              pageSize,
              lang,
              categories,
              levels,
              instructors
            );
          })
        );
      }
    }

    // Default title search for English text
    return this.searchCoursesByTitle(
      searchTerm,
      page,
      pageSize,
      lang,
      categories,
      levels,
      instructors
    );
  }

  /**
   * Search courses by title
   */
  searchCoursesByTitle(
    title: string,
    page = 1,
    pageSize = 10,
    lang = 'ar',
    categories?: number[],
    levels?: string[],
    instructors?: string[]
  ): Observable<SearchResult> {
    const filter = `Title = "${title}"`;
    return this.loadCoursesFromApi({
      lang,
      page,
      pageSize,
      filter,
      categories,
      levels,
      instructors,
    }).pipe(
      tap((result) => {
        // Cache the result
        const cacheKey = this.getCacheKey({
          searchTerm: title,
          page,
          pageSize,
          lang,
        });
        this.searchCache.set(cacheKey, result);
      })
    );
  }

  /**
   * Search courses by ID
   */
  searchCoursesById(
    courseId: number,
    page = 1,
    pageSize = 10,
    categories?: number[],
    levels?: string[],
    instructors?: string[]
  ): Observable<SearchResult> {
    const filter = `id = ${courseId}`;
    return this.loadCoursesFromApi({
      lang: 'ar',
      page,
      pageSize,
      filter,
      categories,
      levels,
      instructors,
    }).pipe(
      tap((result) => {
        // Cache the result
        const cacheKey = this.getCacheKey({
          searchTerm: `id:${courseId}`,
          page,
          pageSize,
        });
        this.searchCache.set(cacheKey, result);
      })
    );
  }

  /**
   * Get all courses with caching
   */
  getAllCourses(
    page = 1,
    pageSize = 10,
    categories?: number[],
    levels?: string[],
    instructors?: string[]
  ): Observable<SearchResult> {
    // Check if we have valid cached data
    if (
      this.allCoursesCache &&
      this.isCacheValid(this.allCoursesCacheTimestamp)
    ) {
      // Apply client-side filtering to cached data
      const filteredCachedCourses = this.applyClientSideFilters(
        this.allCoursesCache,
        categories,
        levels,
        instructors
      );

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCourses = filteredCachedCourses.slice(
        startIndex,
        endIndex
      );

      return of({
        courses: paginatedCourses,
        totalCourses: filteredCachedCourses.length,
        totalPages: Math.ceil(filteredCachedCourses.length / pageSize),
        currentPage: page,
      });
    }

    // Load from API with large page size to get all courses for caching
    const loadPageSize = Math.max(pageSize, 1000); // Ensure we get enough courses for caching

    return this.loadCoursesFromApi({
      lang: 'ar',
      page: 1,
      pageSize: loadPageSize,
      categories,
      levels,
      instructors,
    }).pipe(
      tap((result) => {
        // Cache all courses for future use
        this.allCoursesCache = result.courses;
        this.allCoursesCacheTimestamp = Date.now();
      }),
      map((result) => {
        // Return paginated results for the requested page
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCourses = result.courses.slice(startIndex, endIndex);

        return {
          courses: paginatedCourses,
          totalCourses: result.totalCourses,
          totalPages: result.totalPages,
          currentPage: page,
        };
      })
    );
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.allCoursesCache = null;
    this.allCoursesCacheTimestamp = 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    searchCacheSize: number;
    hasAllCoursesCache: boolean;
    cacheAge: number;
  } {
    return {
      searchCacheSize: this.searchCache.size,
      hasAllCoursesCache: this.allCoursesCache !== null,
      cacheAge: this.allCoursesCache
        ? Date.now() - this.allCoursesCacheTimestamp
        : 0,
    };
  }
}
