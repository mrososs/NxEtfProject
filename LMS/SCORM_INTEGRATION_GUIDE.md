# SCORM Integration Guide for CourseTracker API

This guide explains how to integrate SCORM courses with your CourseTracker API to track user progress, checkpoints, and other SCORM elements.

## Overview

The integration consists of several components:

1. **CourseTrackerService** - Handles API calls to your CourseTracker API
2. **ScormCommunicationService** - Manages communication between SCORM courses and your application
3. **SCORM Wrapper Script** - JavaScript file that should be included in your SCORM courses
4. **Course Viewer Component** - Displays SCORM courses in an iframe with tracking
5. **Course Details Component** - Shows course progress and tracked elements

## API Endpoints

Your CourseTracker API has two main endpoints:

### GET /api/CourseTracker

- **Purpose**: Retrieve tracking data for a specific element and course
- **Parameters**:
  - `element` (string): The SCORM element name (e.g., 'lesson_status', 'score')
  - `courseId` (number): The course ID
- **Response**: String value of the tracked element

### POST /api/CourseTracker

- **Purpose**: Send tracking data to the API
- **Request Body**:
  ```json
  {
    "element": "string",
    "courseId": 0,
    "value": "string"
  }
  ```
- **Response**: Success/failure response

## Integration Steps

### 1. Include SCORM Wrapper in Your Courses

Add the SCORM wrapper script to your SCORM courses by including this in the HTML head:

```html
<script src="/assets/scorm-wrapper.js"></script>
```

### 2. Update Course Viewer Route

Make sure your course viewer route includes the course ID:

```typescript
// In app.routes.ts
{
  path: 'course-viewer/:id',
  loadComponent: () =>
    import('./features/course-viewer/course-viewer.component').then(
      (m) => m.CourseViewerComponent
    ),
  canActivate: [ErrorPageGuard],
}
```

### 3. Launch Course from Course Details

In your course details component, use the `launchCourseInIframe()` method:

```typescript
launchCourseInIframe(): void {
  if (this.courseApiData?.launchUrl) {
    this.iframeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
      this.courseApiData.launchUrl
    );
    this.showIframe = true;

    // Initialize SCORM communication
    setTimeout(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        this._scormCommunicationService.initializeIframeScormCommunication(
          this.courseId,
          iframe as HTMLIFrameElement
        );
      }
    }, 1000);
  }
}
```

## SCORM Elements Tracked

The system tracks the following SCORM elements:

### Standard SCORM Elements

- **lesson_status**: Course completion status (not_attempted, incomplete, completed, failed, passed)
- **lesson_location**: Bookmark/location within the course
- **score**: User's score in the course
- **total_time**: Total time spent in the course
- **suspend_data**: Custom progress data

### Custom Elements

- **completion_percentage**: Course completion percentage (0-100)
- **checkpoint**: Custom checkpoint data for resuming progress

## How It Works

### 1. Course Launch

When a user launches a course:

1. The course viewer component loads the SCORM course in an iframe
2. SCORM communication is initialized between the parent window and iframe
3. The course ID is sent to the SCORM course via postMessage
4. The SCORM wrapper script receives the initialization message

### 2. Progress Tracking

As the user progresses through the course:

1. SCORM API calls are intercepted by the wrapper script
2. Tracking data is sent to the parent window via postMessage
3. The ScormCommunicationService receives the messages
4. Data is sent to the CourseTracker API via HTTP POST
5. Progress is updated in real-time

### 3. Progress Display

On the course details page:

1. Course progress is loaded from the CourseTracker API
2. Progress updates are received via observables
3. UI is updated to show current progress, status, and tracked elements

## Usage Examples

### Starting a Course

```typescript
// In course details component
startCourse(): void {
  if (!this.isEnrolled) {
    this.enrollInCourse();
  } else {
    this.launchCourseInIframe();
  }
}
```

### Refreshing Progress

```typescript
// Refresh progress from API
refreshCourseProgress(): void {
  this._courseTrackerService.getCourseProgress(this.courseId).subscribe({
    next: (progress) => {
      this.courseProgress = progress;
      console.log('Progress refreshed:', progress);
    }
  });
}
```

### Getting Tracked Elements

```typescript
// Get all tracked elements for display
getTrackedElements(): any[] {
  if (!this.courseProgress?.elements) return [];

  return this.courseProgress.elements.map(element => ({
    name: this.getElementDisplayName(element.name),
    value: element.value,
    type: element.type,
    timestamp: element.timestamp
  }));
}
```

## SCORM Wrapper Features

The SCORM wrapper script provides:

### Automatic Tracking

- Intercepts all SCORM API calls
- Sends tracking data to parent window
- Sends data directly to CourseTracker API
- Handles course completion events

### Progress Calculation

- Calculates completion percentage from scores
- Tracks lesson status changes
- Manages checkpoint data
- Throttles progress updates to prevent spam

### Error Handling

- Graceful fallback if SCORM API not found
- Mock SCORM API for testing
- Error logging and reporting

## Testing the Integration

### 1. Test Course Launch

1. Navigate to a course details page
2. Click "Start Course" or "Launch Course"
3. Verify the course loads in an iframe
4. Check browser console for SCORM initialization messages

### 2. Test Progress Tracking

1. Interact with the SCORM course
2. Check browser console for tracking messages
3. Verify data is sent to CourseTracker API
4. Check course details page for progress updates

### 3. Test Progress Display

1. Complete some activities in the course
2. Return to course details page
3. Click "Refresh Progress" button
4. Verify progress is updated correctly

## Troubleshooting

### Common Issues

1. **SCORM API not found**

   - Check if SCORM wrapper script is included
   - Verify SCORM course is properly configured
   - Check browser console for error messages

2. **No tracking data received**

   - Verify CourseTracker API is accessible
   - Check network requests in browser dev tools
   - Ensure course ID is correctly passed

3. **Progress not updating**
   - Check if observables are properly subscribed
   - Verify CourseTracker API responses
   - Check for JavaScript errors in console

### Debug Mode

Enable debug logging by setting:

```typescript
// In scorm-communication.service.ts
private debugMode = true;
```

This will log all SCORM messages and API calls to the console.

## API Configuration

Make sure your CourseTracker API is properly configured:

1. **CORS**: Allow requests from your frontend domain
2. **Authentication**: Implement proper authentication if required
3. **Rate Limiting**: Consider rate limiting for progress updates
4. **Data Validation**: Validate incoming tracking data

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Progress Throttling**: Limit progress update frequency
3. **Data Validation**: Validate SCORM data before sending to API
4. **User Feedback**: Show loading states and success/error messages
5. **Testing**: Test with various SCORM courses and scenarios

## Security Considerations

1. **Input Validation**: Validate all SCORM data before processing
2. **XSS Prevention**: Sanitize data before displaying
3. **CSRF Protection**: Implement CSRF tokens if needed
4. **Access Control**: Ensure users can only access their own progress data

## Performance Optimization

1. **Debouncing**: Debounce progress updates to reduce API calls
2. **Caching**: Cache progress data to reduce API requests
3. **Lazy Loading**: Load progress data only when needed
4. **Compression**: Enable gzip compression for API responses

This integration provides a robust solution for tracking SCORM course progress and displaying it in your LMS application.
