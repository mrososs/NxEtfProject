# Course & Instructor API Integration

This document describes the integration of the course and instructor APIs into the LMS project.

## APIs Used

### Course APIs

#### 1. Get All Courses

- **URL**: `http://etfapi.itechpro-eg.com/api/Course?lang=ar`
- **Method**: GET
- **Response**: Array of course objects
- **Example Response**:

```json
[
  {
    "id": 1,
    "title": "اختبار",
    "description": "اختبار",
    "launchUrl": "/courses/Test/index.html",
    "uploadedAt": "2025-07-30T23:38:38.4657338"
  }
]
```

#### 2. Get Course by ID

- **URL**: `http://etfapi.itechpro-eg.com/api/Course/{id}?lang=ar`
- **Method**: GET
- **Response**: Single course object

### Instructor APIs

#### 1. Get All Instructors (Paginated)

- **URL**: `http://etfapi.itechpro-eg.com/api/Trainer?page=1&pageSize=10&sortBy=Id&sortDir=desc`
- **Method**: GET
- **Response**: Paginated instructor response
- **Example Response**:

```json
{
  "data": [
    {
      "id": 1,
      "name": "أحمد محمد",
      "title": "مدرب تطوير الويب",
      "mainSkill": "JavaScript",
      "numberOfCourses": 5,
      "numberOfStudents": 120,
      "starRanking": 4.5,
      "about": "مدرب محترف في تطوير الويب",
      "channels": {
        "linkedin": ["https://linkedin.com/in/ahmed"],
        "email": ["ahmed@example.com"]
      }
    }
  ],
  "count": 1,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

#### 2. Get Instructor by ID

- **URL**: `http://etfapi.itechpro-eg.com/api/Trainer/{id}`
- **Method**: GET
- **Response**: Single instructor object

## Implementation Details

### HTTP Interceptor

**apiInterceptor** (`src/app/core/interceptors/api.interceptor.ts`)

- Automatically adds base URL to API requests
- Intercepts any URL that doesn't start with `http://` or `https://`
- Transforms relative URLs to full API URLs
- Examples:
  - `Course` → `http://etfapi.itechpro-eg.com/api/Course`
  - `Trainer` → `http://etfapi.itechpro-eg.com/api/Trainer`
  - `Trainer/1` → `http://etfapi.itechpro-eg.com/api/Trainer/1`
- Allows for cleaner service code without hardcoded URLs

### Services Created

1. **CourseApiService** (`src/app/features/courses/services/course-api.service.ts`)

   - Handles direct API calls using interceptor
   - Transforms API data to UI format
   - Methods:
     - `getAllCourses(lang: string)`: Get all courses
     - `getCourseById(id: number, lang: string)`: Get single course
     - `transformApiCourseToUiCourse(apiCourse: ApiCourse)`: Transform API data

2. **InstructorApiService** (`src/app/features/courses/services/instructor-api.service.ts`)

   - Handles instructor API calls with pagination and filtering
   - Transforms API data to UI format
   - Methods:
     - `getAllInstructors(params: InstructorQueryParams)`: Get instructors with pagination
     - `getInstructorById(id: number)`: Get single instructor
     - `transformApiInstructorToUiInstructor(apiInstructor: ApiInstructor)`: Transform API data
     - `transformApiInstructorResponseToUiInstructors(apiResponse: ApiInstructorResponse)`: Transform response

3. **Updated HomePageService** (`src/app/features/courses/services/home-page.service.ts`)
   - Integrates with both CourseApiService and InstructorApiService
   - Provides fallback to local data
   - Methods:
     - `getCoursesFromApi(lang: string)`: Get courses from API
     - `getCourseByIdFromApi(id: number, lang: string)`: Get single course from API
     - `getInstructorsFromApi(params: InstructorQueryParams)`: Get instructors from API
     - `getInstructorByIdFromApi(id: number)`: Get single instructor from API
     - `getTopInstructors()`: Get first 3 top-rated instructors for course-instructor component
     - `getAllCourses(lang: string)`: Get courses from both API and local data

### Models Updated

1. **Course Model** (`src/app/features/courses/model/course.model.ts`)

   - Added `ApiCourse` interface for API response
   - Extended `Course` interface with API fields
   - Added optional fields: `description`, `launchUrl`, `uploadedAt`

2. **Instructor Model** (`src/app/features/courses/model/instructor.model.ts`)

   - Added `ApiInstructor` interface for API response
   - Added `ApiInstructorResponse` interface for paginated responses
   - Updated `Instructor` interface to match API structure
   - Added `InstructorQueryParams` interface for query parameters
   - Added backward compatibility properties for old local data structure

### Components Updated

1. **TrainingCourseComponent** (`src/app/features/courses/Training-course/`)

   - Now fetches courses from API
   - Includes loading and error states
   - Fallback to local data if API fails

2. **CourseCardComponent** (`src/app/features/homepage/course-card/`)

   - Updated to handle both API and local courses
   - Dynamic navigation based on course type
   - Dynamic button text

3. **CourseDetailsComponent** (New)

   - Displays individual course details
   - Fetches course data from API
   - Includes launch functionality

4. **InstructorDetailsComponent** (`src/app/features/instructor-list/instructor-details/`)

   - Displays individual instructor details
   - Fetches instructor data from API
   - Shows instructor stats, channels, and contact information

5. **InstructorListComponent** (`src/app/features/instructor-list/`)

   - Now fetches all instructors from API with pagination
   - Includes loading and error states
   - Fallback to local data if API fails
   - Displays instructors in a responsive grid layout

6. **CourseInstructorComponent** (`src/app/features/homepage/course-instructor/`)

   - Now fetches first 3 top-rated instructors from API
   - Includes loading and error states
   - Fallback to local data if API fails
   - Shows instructors as checkboxes for filtering

7. **HomepageComponent** (`src/app/features/homepage/`)
   - Now fetches courses from API using `course$` observable
   - Includes fallback courses for offline/error scenarios
   - Dynamic course display with proper error handling

### Routing

Added routes for course and instructor details:

```typescript
{
  path: 'courses/:id',
  loadComponent: () =>
    import('./features/courses/course-details/course-details.component').then(
      (c) => c.CourseDetailsComponent
    ),
},
{
  path: 'instructorDetails/:id',
  loadComponent: () =>
    import('./features/instructor-list/instructor-details/instructor-details.component').then(
      (c) => c.InstructorDetailsComponent
    ),
}
```

## Usage

### Displaying Courses from API

```typescript
// In component
private _homePageService = inject(HomePageService);

// Get courses from API
course$ = this._homePageService.getCoursesFromApi('ar');

// In template
<div *ngFor="let course of course$ | async">
  <app-course-card [course]="course"></app-course-card>
</div>
```

### Getting Single Course

```typescript
// In component
this._homePageService.getCourseByIdFromApi(courseId, 'ar').subscribe({
  next: (course: Course) => {
    this.course = course;
  },
  error: (err) => {
    console.error('Error fetching course:', err);
  },
});
```

### Getting Instructors with Pagination

```typescript
// In component
const params: InstructorQueryParams = {
  page: 1,
  pageSize: 10,
  sortBy: 'Name',
  sortDir: 'asc',
};

this._homePageService.getInstructorsFromApi(params).subscribe({
  next: (instructors: Instructor[]) => {
    this.instructors = instructors;
  },
  error: (err) => {
    console.error('Error fetching instructors:', err);
  },
});
```

### Getting Top 3 Instructors for Course-Instructor Component

```typescript
// In component
this._homePageService.getTopInstructors().subscribe({
  next: (instructors: Instructor[]) => {
    this.categories = instructors.map((instructor) => ({
      label: instructor.name,
      value: `id:${instructor.id}`,
      checked: false,
    }));
  },
  error: (err) => {
    console.error('Error fetching top instructors:', err);
  },
});
```

### Getting Single Instructor

```typescript
// In component
this._homePageService.getInstructorByIdFromApi(instructorId).subscribe({
  next: (instructor: Instructor) => {
    this.instructor = instructor;
  },
  error: (err) => {
    console.error('Error fetching instructor:', err);
  },
});
```

### Using the Interceptor

The interceptor automatically handles base URL transformation for any URL that doesn't start with `http://` or `https://`:

```typescript
// Service code (clean, no hardcoded URLs)
getAllCourses(lang = 'ar'): Observable<ApiCourse[]> {
  return this._http.get<ApiCourse[]>(`Course?lang=${lang}`);
}

getAllInstructors(params: InstructorQueryParams = {}): Observable<ApiInstructorResponse> {
  return this._http.get<ApiInstructorResponse>('Trainer', { params: httpParams });
}

// Interceptor transforms to:
// http://etfapi.itechpro-eg.com/api/Course?lang=ar
// http://etfapi.itechpro-eg.com/api/Trainer?page=1&pageSize=10
```

## Features

1. **HTTP Interceptor**: Automatic base URL handling for cleaner code
2. **Flexible URL Handling**: Works with or without leading slashes
3. **Pagination Support**: Full pagination support for instructor lists
4. **Query Parameters**: Support for sorting, filtering, and search
5. **Error Handling**: Graceful fallback to local data if API fails
6. **Loading States**: Proper loading indicators during API calls
7. **Type Safety**: Full TypeScript support with proper interfaces
8. **Responsive Design**: Mobile-friendly course and instructor display
9. **Navigation**: Seamless navigation between lists and details
10. **Testing**: Comprehensive unit tests for API services and interceptor
11. **Homepage Integration**: Dynamic course loading in homepage with fallback
12. **Instructor List**: Full instructor listing with API integration
13. **Top Instructors**: First 3 top-rated instructors for course-instructor component
14. **Backward Compatibility**: Support for old local data structure

## Testing

Run the tests to verify API integration:

```bash
# Test API services
npm test -- --include="**/course-api.service.spec.ts"
npm test -- --include="**/instructor-api.service.spec.ts"

# Test interceptor
npm test -- --include="**/api.interceptor.spec.ts"
```

## Configuration

The interceptor is registered in `app.config.ts`:

```typescript
provideHttpClient(withInterceptorsFromDi(), withInterceptors([apiInterceptor]));
```

## URL Transformation Examples

| Service URL                  | Interceptor Output                                             |
| ---------------------------- | -------------------------------------------------------------- |
| `Course`                     | `http://etfapi.itechpro-eg.com/api/Course`                     |
| `Course/1`                   | `http://etfapi.itechpro-eg.com/api/Course/1`                   |
| `Trainer`                    | `http://etfapi.itechpro-eg.com/api/Trainer`                    |
| `Trainer/1`                  | `http://etfapi.itechpro-eg.com/api/Trainer/1`                  |
| `Trainer?page=1&pageSize=10` | `http://etfapi.itechpro-eg.com/api/Trainer?page=1&pageSize=10` |
| `http://example.com/api`     | `http://example.com/api` (unchanged)                           |
| `https://api.example.com`    | `https://api.example.com` (unchanged)                          |

## Query Parameters for Instructors

The instructor API supports the following query parameters:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 10)
- `sortBy`: Sort field (`Id`, `Name`, `Title`, `MainSkill`, `NumberOfCourses`, `NumberOfStudents`, `StarRanking`)
- `sortDir`: Sort direction (`asc`, `desc`)
- `search`: Search term for instructor name or title
- `mainSkill`: Filter by main skill

## Future Enhancements

1. **Caching**: Implement caching for API responses
2. **Pagination**: Add pagination for large course lists
3. **Search**: Add search functionality for courses
4. **Filtering**: Add filtering by level, category, etc.
5. **Offline Support**: Cache courses and instructors for offline viewing
6. **Environment Configuration**: Move base URL to environment variables
7. **Real-time Updates**: Implement WebSocket for real-time data updates
