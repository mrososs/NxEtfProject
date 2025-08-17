# Course API Setup Guide

## API Endpoint Verification

The course API is now configured to work with the correct endpoint:

**✅ Working API Endpoint:**

```
https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar&page=1&pageSize=10&sortBy=Id&sortDir=desc
```

## Changes Made

### 1. Updated Course API Service (`course-api.service.ts`)

**Before:**

```typescript
return this._http.get<any>(`Course`, { headers, params: httpParams });
```

**After:**

```typescript
return this._http.get<any>(`api/Course`, {
  headers,
  params: httpParams,
});
```

### 2. Updated Course Details Endpoint

**Before:**

```typescript
return this._http.get<ApiCourse>(`Course/${id}?lang=${lang}`);
```

**After:**

```typescript
return this._http.get<ApiCourse>(`api/Course/${id}?lang=${lang}`);
```

## API Response Structure

Based on the working API response, the structure is:

```json
{
  "data": [
    {
      "id": 18,
      "title": "انت-كمشرف",
      "description": "انت-كمشرف",
      "launchUrl": "http://etfapi.itechpro-eg.com/courses/you-as-a-supervisor/scormcontent/index.html",
      "uploadedAt": "2025-08-14T00:29:50.0836387",
      "reviews": []
    }
  ],
  "count": 17,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

## Testing the API

### 1. Browser Console Test

```javascript
// Test the API directly
fetch('https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net/api/Course?lang=ar&page=1&pageSize=5', {
  credentials: 'include',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('token'),
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log('✅ API Response:', data);
    console.log('📊 Total Courses:', data.count);
    console.log('📄 Courses:', data.data);
  })
  .catch((error) => console.error('❌ API Error:', error));
```

### 2. Angular Service Test

```typescript
// In any component, test the service
this.courseApiService.getAllCourses('ar').subscribe({
  next: (courses) => {
    console.log('✅ Courses loaded:', courses);
    console.log('📊 Number of courses:', courses.length);
  },
  error: (error) => {
    console.error('❌ Error loading courses:', error);
  },
});
```

### 3. Network Tab Verification

1. Open browser DevTools → Network tab
2. Navigate to courses page
3. Look for request to: `api/Course?lang=ar&page=1&pageSize=10&sortBy=Id&sortDir=desc`
4. Verify response status is 200
5. Check response contains course data

## Expected Behavior

### ✅ **What Should Work:**

1. **Course Listing**: All courses should load from the API
2. **Pagination**: Page navigation should work
3. **Filtering**: Search and filters should work
4. **Course Details**: Individual course pages should load
5. **SCORM Launch**: Course launch URLs should work

### 📊 **API Parameters:**

- `lang=ar` - Arabic language
- `page=1` - First page
- `pageSize=10` - 10 courses per page
- `sortBy=Id` - Sort by ID
- `sortDir=desc` - Descending order

## Troubleshooting

### Common Issues:

1. **CORS Errors**:

   - Check Azure CORS configuration

2. **Authentication Errors**:

   - Verify JWT token is valid
   - Check Authorization header

3. **Empty Response**:

   - Check API endpoint URL
   - Verify parameters are correct

4. **Launch URL Issues**:
   - Note: Launch URLs still point to old domain
   - This is a backend configuration issue

## Debug Information

### Console Logs to Check:

```typescript
// These logs should appear in console:
console.log('Course API request params:', httpParams.toString());
console.log('Full URL will be:', `api/Course?${httpParams.toString()}`);
console.log('Raw courses API response:', response);
```

### Network Request Details:

- **Method**: GET
- **URL**: `api/Course?lang=ar&page=1&pageSize=10&sortBy=Id&sortDir=desc`
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Authorization: Bearer <token>`
- **Credentials**: `omit`

## Notes

- ✅ The API is working and returning data
- ⚠️ Launch URLs still point to old domain (`http://etfapi.itechpro-eg.com`)
- 🔧 This is a backend configuration that needs updating
- 📱 The frontend is now correctly configured to use the new API

## Next Steps

1. **Test the course listing page** - should load courses from API
2. **Test course details page** - should load individual course data
3. **Test course enrollment** - should work with new API endpoints
4. **Monitor for any errors** - check console and network tab
5. **Backend team** - update launch URLs to new domain
