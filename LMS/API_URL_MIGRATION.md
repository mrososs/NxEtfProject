# API URL Migration Guide

This document summarizes the changes made to migrate from the old API URL to the new Azure URL.

## Overview

**Old Base URL**: `http://etfapi.itechpro-eg.com/api`  
**New Base URL**: `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net`

## Changes Made

### 1. API Interceptor Update

**File**: `LMS/src/app/core/interceptors/api.interceptor.ts`

- Updated base URL from `http://etfapi.itechpro-eg.com/api` to `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net`
- The interceptor now handles all relative endpoints and prepends the new base URL

### 2. Environment Files

**Files**:

- `LMS/src/environments/environment.ts`
- `LMS/src/environments/environment.prod.ts`

**Changes**:

- Updated `apiUrl` from `http://etfapi.itechpro-eg.com` to `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net`
- Removed unused environment variables

### 3. Service Updates

#### Course Details Component

**File**: `LMS/src/app/features/courses/course-details/course-details.component.ts`

- **Before**: `http://etfapi.itechpro-eg.com/api/Course/${this.courseId}`
- **After**: `Course/${this.courseId}`

#### Home Page Service

**File**: `LMS/src/app/features/courses/services/home-page.service.ts`

- **getCourseDetails()**:
  - **Before**: `http://etfapi.itechpro-eg.com/api/Course/${courseId}/details`
  - **After**: `Course/${courseId}/details`
- **postCourseReview()**:
  - **Before**: `http://etfapi.itechpro-eg.com/api/Course/review`
  - **After**: `Course/review`

#### Enrollment Service

**File**: `LMS/src/app/features/courses/services/enrollment.service.ts`

- **Before**: `http://etfapi.itechpro-eg.com/api/Enrollment`
- **After**: `Enrollment`

#### Profile Service

**File**: `LMS/src/app/features/profile/profile.service.ts`

- **Before**: `http://etfapi.itechpro-eg.com/api/profile/me`
- **After**: `profile/me`

### 4. Test Files

**File**: `LMS/src/app/core/interceptors/api.interceptor.spec.ts`

- Updated all test cases to use the new Azure base URL
- Updated expected URLs in test assertions

## How It Works

### API Interceptor Pattern

All API calls now use relative endpoints, and the API interceptor automatically prepends the base URL:

```typescript
// Service code (relative endpoint)
this.http.get('Course/123');

// API Interceptor transforms to:
// https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/Course/123
```

### Benefits of This Approach

1. **Centralized Configuration**: All API URLs are managed in one place (the interceptor)
2. **Easy Environment Switching**: Just change the base URL in the interceptor
3. **Clean Service Code**: Services use simple relative endpoints
4. **Consistent URL Handling**: All API calls go through the same interceptor

## Migration Checklist

- [x] Update API interceptor base URL
- [x] Update environment files
- [x] Remove hardcoded URLs from course details component
- [x] Remove hardcoded URLs from home page service
- [x] Remove hardcoded URLs from enrollment service
- [x] Remove hardcoded URLs from profile service
- [x] Update test files
- [x] Verify SCORM wrapper uses relative endpoints (already correct)

## Testing

After the migration, test the following endpoints:

1. **Course API**: `Course?lang=ar`
2. **Course Details**: `Course/{id}/details`
3. **Course Review**: `Course/review`
4. **Enrollment**: `Enrollment`
5. **Profile**: `profile/me`
6. **CourseTracker**: `CourseTracker` (for SCORM integration)

## Notes

- The SCORM wrapper script already uses relative endpoints (`/api/CourseTracker`) which will be handled by the interceptor
- All existing functionality should work the same way, just with the new base URL
- The API interceptor handles both relative and absolute URLs correctly
- No changes needed to the frontend routing or component logic

## Rollback Plan

If needed, you can rollback by:

1. Reverting the API interceptor base URL
2. Reverting the environment files
3. Restoring the hardcoded URLs in services (not recommended)

## Future Considerations

- Consider using environment-specific base URLs for different deployment environments
- Monitor API response times with the new Azure endpoint
- Ensure CORS is properly configured on the Azure endpoint
- Consider implementing retry logic for network issues
