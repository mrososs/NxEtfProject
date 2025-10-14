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
    console.log(
      'Searching for Arabic title:',
      searchTerm,
      'in',
      courses.length,
      'courses'
    );

    const course = courses.find((c) => {
      const titleMatch = c.title?.toLowerCase().includes(searchTerm);
      const titleArMatch = c.titleAr?.toLowerCase().includes(searchTerm);
      const titleEnMatch = c.titleEn?.toLowerCase().includes(searchTerm);

      if (titleMatch || titleArMatch || titleEnMatch) {
        console.log('Found matching course:', {
          id: c.id,
          title: c.title,
          titleAr: c.titleAr,
          titleEn: c.titleEn,
          match: { titleMatch, titleArMatch, titleEnMatch },
        });
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
  }): string {
    let url = `${this.baseUrl}?lang=${params.lang}&page=${params.page}&pageSize=${params.pageSize}&sortBy=Id&sortDir=desc`;

    if (params.filter) {
      url += `&filter=${encodeURIComponent(params.filter)}`;
    }

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

        return {
          courses: mergedCourses,
          totalCourses: arabicResponse.count || 0,
          totalPages: arabicResponse.totalPages || 1,
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
   * Get cache key for search
   */
  private getCacheKey(params: SearchParams): string {
    return `${params.searchTerm}-${params.page}-${params.pageSize}-${params.lang}`;
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
    const { searchTerm, page = 1, pageSize = 10, lang = 'ar' } = params;

    // Check cache first
    const cacheKey = this.getCacheKey(params);
    const cachedResult = this.searchCache.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached search result for:', searchTerm);
      return of(cachedResult);
    }

    // Handle empty search term - return all courses
    if (!searchTerm || searchTerm.trim() === '') {
      return this.getAllCourses(page, pageSize);
    }

    // Check if search term contains Arabic characters
    if (this.isArabicText(searchTerm)) {
      console.log('Arabic text detected:', searchTerm);

      // For Arabic text, first try to find course ID from cached courses
      if (
        this.allCoursesCache &&
        this.isCacheValid(this.allCoursesCacheTimestamp)
      ) {
        console.log('Searching in cached courses for Arabic text');
        const courseId = this.findCourseIdByArabicTitle(
          searchTerm,
          this.allCoursesCache
        );
        if (courseId) {
          console.log(
            'Found Arabic course ID:',
            courseId,
            'for search term:',
            searchTerm
          );
          return this.searchCoursesById(courseId, page, pageSize);
        } else {
          console.log(
            'No matching course ID found in cache, trying title search'
          );
        }
      } else {
        console.log('No cached courses available, loading all courses first');
        // Load all courses first to get the cache, then search
        return this.getAllCourses(1, 1000).pipe(
          switchMap(() => {
            // After loading all courses, try to find the course ID
            if (this.allCoursesCache) {
              const courseId = this.findCourseIdByArabicTitle(
                searchTerm,
                this.allCoursesCache
              );
              if (courseId) {
                console.log(
                  'Found Arabic course ID after loading cache:',
                  courseId,
                  'for search term:',
                  searchTerm
                );
                return this.searchCoursesById(courseId, page, pageSize);
              }
            }
            // Fallback to title search
            return this.searchCoursesByTitle(searchTerm, page, pageSize, lang);
          })
        );
      }
    }

    // Default title search for English text
    console.log('Performing title search for:', searchTerm);
    return this.searchCoursesByTitle(searchTerm, page, pageSize, lang);
  }

  /**
   * Search courses by title
   */
  searchCoursesByTitle(
    title: string,
    page = 1,
    pageSize = 10,
    lang = 'ar'
  ): Observable<SearchResult> {
    console.log('Searching by title:', title);

    const filter = `Title = "${title}"`;
    return this.loadCoursesFromApi({ lang, page, pageSize, filter }).pipe(
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
    pageSize = 10
  ): Observable<SearchResult> {
    console.log('Searching by ID:', courseId);

    const filter = `id = ${courseId}`;
    return this.loadCoursesFromApi({ lang: 'ar', page, pageSize, filter }).pipe(
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
  getAllCourses(page = 1, pageSize = 10): Observable<SearchResult> {
    console.log('Loading all courses');

    // Check if we have valid cached data
    if (
      this.allCoursesCache &&
      this.isCacheValid(this.allCoursesCacheTimestamp)
    ) {
      console.log('Returning cached all courses');
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCourses = this.allCoursesCache.slice(startIndex, endIndex);

      return of({
        courses: paginatedCourses,
        totalCourses: this.allCoursesCache.length,
        totalPages: Math.ceil(this.allCoursesCache.length / pageSize),
        currentPage: page,
      });
    }

    // Load from API with large page size to get all courses for caching
    const loadPageSize = Math.max(pageSize, 1000); // Ensure we get enough courses for caching

    return this.loadCoursesFromApi({
      lang: 'ar',
      page: 1,
      pageSize: loadPageSize,
    }).pipe(
      tap((result) => {
        // Cache all courses for future use
        this.allCoursesCache = result.courses;
        this.allCoursesCacheTimestamp = Date.now();
        console.log('Cached all courses:', result.courses.length);
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
    console.log('Search cache cleared');
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
