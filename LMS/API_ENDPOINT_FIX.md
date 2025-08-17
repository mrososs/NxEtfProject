# API Endpoint Fix for HTML Redirect Issue

## Problem Description

The API was returning a 200 OK status but with `content-type: text/html; charset=utf-8` instead of `application/json`. This indicated that the Azure API was redirecting to an HTML page (likely a login page or error page) instead of returning the expected JSON response.

## Root Cause

The issue was that the API endpoints were missing the `/api` prefix. The Azure API expects endpoints to be in the format:

- ❌ `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/profile/me`
- ✅ `https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/profile/me`

## Changes Made

### 1. Profile Service

**File**: `LMS/src/app/features/profile/profile.service.ts`

**Changes**:

- Updated endpoint from `profile/me` to `api/profile/me`
- Added content-type checking to detect HTML responses
- Added specific error handling for HTML redirects

```typescript
// Before
private readonly PROFILE_ENDPOINT = 'profile/me';

// After
private readonly PROFILE_ENDPOINT = 'api/profile/me';
```

**Enhanced Error Handling**:

```typescript
// Check if response is HTML instead of JSON
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('text/html')) {
  console.error('API returned HTML instead of JSON. This usually means a redirect to login page.');
  throw new Error('API returned HTML instead of JSON - possible redirect to login page');
}
```

### 2. Enrollment Service

**File**: `LMS/src/app/features/courses/services/enrollment.service.ts`

**Changes**:

- Updated base URL from `Enrollment` to `api/Enrollment`

```typescript
// Before
private readonly baseUrl = 'Enrollment';

// After
private readonly baseUrl = 'api/Enrollment';
```

### 3. Home Page Service

**File**: `LMS/src/app/features/courses/services/home-page.service.ts`

**Changes**:

- Updated course details endpoint from `Course/${courseId}/details` to `api/Course/${courseId}/details`
- Updated course review endpoint from `Course/review` to `api/Course/review`

```typescript
// Before
const url = `Course/${courseId}/details`;
const url = 'Course/review';

// After
const url = `api/Course/${courseId}/details`;
const url = 'api/Course/review';
```

### 4. Course Details Component

**File**: `LMS/src/app/features/courses/course-details/course-details.component.ts`

**Changes**:

- Updated course API endpoint from `Course/${this.courseId}` to `api/Course/${this.courseId}`

```typescript
// Before
const apiUrl = `Course/${this.courseId}`;

// After
const apiUrl = `api/Course/${this.courseId}`;
```

## How It Works Now

### API Interceptor Pattern

The API interceptor now correctly handles all endpoints:

```typescript
// Service code (with /api prefix)
this.http.get('api/profile/me');

// API Interceptor transforms to:
// https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/profile/me
```

### Error Detection

The profile service now detects when the API returns HTML instead of JSON:

1. **Content-Type Check**: Monitors response headers for `text/html`
2. **Error Handling**: Throws specific error for HTML responses
3. **User Feedback**: Redirects to appropriate error page

## Testing

After the fix, test the following endpoints:

1. **Profile API**: `api/profile/me` ✅
2. **Course API**: `api/Course?lang=ar` ✅
3. **Course Details**: `api/Course/{id}/details` ✅
4. **Course Review**: `api/Course/review` ✅
5. **Enrollment**: `api/Enrollment` ✅
6. **CourseTracker**: `api/CourseTracker` ✅ (for SCORM integration)

## Expected Behavior

- ✅ API calls should return JSON responses
- ✅ Content-Type should be `application/json`
- ✅ No more HTML redirects
- ✅ Proper error handling for authentication issues

## Debugging

If you still see HTML responses, check:

1. **Authentication**: Ensure the JWT token is valid
2. **CORS**: Verify CORS is properly configured on Azure
3. **Endpoint Path**: Confirm the endpoint exists on the Azure API
4. **Network Tab**: Check the actual request URL in browser dev tools

## Rollback Plan

If needed, you can rollback by:

1. Reverting the `/api` prefix changes in all services
2. Removing the content-type checking in profile service
3. Testing with the original endpoints

## Notes

- The SCORM wrapper script already uses the correct `/api/CourseTracker` endpoint
- All existing functionality should work the same way, just with the correct API paths
- The enhanced error handling provides better debugging information
- No changes needed to the frontend routing or component logic
