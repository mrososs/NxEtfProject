import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CourseTrackerService } from './course-tracker.service';
import {
  CourseTrackerRequest,
  CourseTrackerResponse,
} from '../model/course-tracker.model';

describe('CourseTrackerService', () => {
  let service: CourseTrackerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseTrackerService],
    });
    service = TestBed.inject(CourseTrackerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get course tracker data', () => {
    const mockResponse = 'completed';
    const element = 'lesson_status';
    const courseId = 1;

    service.getCourseTracker(element, courseId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `CourseTracker?element=${element}&courseId=${courseId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should post course tracker data', () => {
    const mockRequest: CourseTrackerRequest = {
      element: 'lesson_status',
      courseId: 1,
      value: 'completed',
    };

    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Tracking data saved successfully',
    };

    service.postCourseTracker(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should track lesson status', () => {
    const courseId = 1;
    const status = 'completed';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Lesson status tracked successfully',
    };

    service.trackLessonStatus(courseId, status).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'lesson_status',
      courseId: courseId,
      value: status,
    });
    req.flush(mockResponse);
  });

  it('should track lesson location', () => {
    const courseId = 1;
    const location = 'slide_3';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Lesson location tracked successfully',
    };

    service.trackLessonLocation(courseId, location).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'lesson_location',
      courseId: courseId,
      value: location,
    });
    req.flush(mockResponse);
  });

  it('should track score', () => {
    const courseId = 1;
    const score = '85';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Score tracked successfully',
    };

    service.trackScore(courseId, score).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'score',
      courseId: courseId,
      value: score,
    });
    req.flush(mockResponse);
  });

  it('should track total time', () => {
    const courseId = 1;
    const time = '0001:30:45.67';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Total time tracked successfully',
    };

    service.trackTotalTime(courseId, time).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'total_time',
      courseId: courseId,
      value: time,
    });
    req.flush(mockResponse);
  });

  it('should track suspend data', () => {
    const courseId = 1;
    const suspendData = '{"slide": 3, "progress": 75}';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Suspend data tracked successfully',
    };

    service.trackSuspendData(courseId, suspendData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'suspend_data',
      courseId: courseId,
      value: suspendData,
    });
    req.flush(mockResponse);
  });

  it('should track custom element', () => {
    const courseId = 1;
    const element = 'custom_progress';
    const value = '75%';
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Custom element tracked successfully',
    };

    service
      .trackCustomElement(courseId, element, value)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: element,
      courseId: courseId,
      value: value,
    });
    req.flush(mockResponse);
  });

  it('should initialize course tracking', () => {
    const courseId = 1;
    const mockResponse: CourseTrackerResponse = {
      success: true,
      message: 'Course tracking initialized successfully',
    };

    service.initializeCourseTracking(courseId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('CourseTracker');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      element: 'lesson_status',
      courseId: courseId,
      value: 'not_attempted',
    });
    req.flush(mockResponse);
  });

  it('should get course progress', () => {
    const courseId = 1;
    const mockProgress = {
      courseId: courseId,
      userId: 1,
      elements: [],
      lastUpdated: new Date(),
      completionPercentage: 75,
      status: 'in_progress' as const,
    };

    service.getCourseProgress(courseId).subscribe((progress) => {
      expect(progress).toEqual(mockProgress);
    });
  });
});
