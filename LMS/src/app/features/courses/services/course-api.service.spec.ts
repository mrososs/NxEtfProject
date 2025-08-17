import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CourseApiService } from './course-api.service';
import { ApiCourse } from '../model/course.model';

describe('CourseApiService', () => {
  let service: CourseApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseApiService],
    });
    service = TestBed.inject(CourseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all courses from API', () => {
    const mockCourses: ApiCourse[] = [
      {
        id: 1,
        title: 'اختبار',
        description: 'اختبار',
        launchUrl: '/courses/Test/index.html',
        uploadedAt: '2025-07-30T23:38:38.4657338',
      },
    ];

    service.getAllCourses('ar').subscribe((courses) => {
      expect(courses).toEqual(mockCourses);
    });

    const req = httpMock.expectOne('api/Course?lang=ar');
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should get course by ID from API', () => {
    const mockCourse: ApiCourse = {
      id: 1,
      title: 'اختبار',
      description: 'اختبار',
      launchUrl: '/courses/Test/index.html',
      uploadedAt: '2025-07-30T23:38:38.4657338',
    };

    service.getCourseById(1, 'ar').subscribe((course) => {
      expect(course).toEqual(mockCourse);
    });

    const req = httpMock.expectOne('Course/1?lang=ar');
    expect(req.request.method).toBe('GET');
    req.flush(mockCourse);
  });

  it('should transform API course to UI course', () => {
    const apiCourse: ApiCourse = {
      id: 1,
      title: 'اختبار',
      description: 'اختبار',
      launchUrl: '/courses/Test/index.html',
      uploadedAt: '2025-07-30T23:38:38.4657338',
    };

    const uiCourse = service.transformApiCourseToUiCourse(apiCourse);

    expect(uiCourse.id).toBe(1);
    expect(uiCourse.title).toBe('اختبار');
    expect(uiCourse.description).toBe('اختبار');
    expect(uiCourse.launchUrl).toBe('/courses/Test/index.html');
    expect(uiCourse.uploadedAt).toBe('2025-07-30T23:38:38.4657338');
    expect(uiCourse.level).toBe('مبتدئ');
    expect(uiCourse.rating).toBe(4.5);
    expect(uiCourse.lectures).toBe(12);
  });
});
