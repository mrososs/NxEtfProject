import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { InstructorApiService } from './instructor-api.service';
import {
  ApiInstructor,
  ApiInstructorResponse,
} from '../model/instructor.model';

describe('InstructorApiService', () => {
  let service: InstructorApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InstructorApiService],
    });
    service = TestBed.inject(InstructorApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all instructors with default parameters', () => {
    const mockResponse: ApiInstructorResponse = {
      data: [
        {
          id: 1,
          name: 'أحمد محمد',
          title: 'مدرب تطوير الويب',
          mainSkill: 'JavaScript',
          numberOfCourses: 5,
          numberOfStudents: 120,
          starRanking: 4.5,
          about: 'مدرب محترف في تطوير الويب',
          channels: {
            linkedin: ['https://linkedin.com/in/ahmed'],
            email: ['ahmed@example.com'],
          },
        },
      ],
      count: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    };

    service.getAllInstructors().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('Trainer');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all instructors with query parameters', () => {
    const mockResponse: ApiInstructorResponse = {
      data: [],
      count: 0,
      pageNumber: 1,
      pageSize: 5,
      totalPages: 0,
    };

    const params = {
      page: 1,
      pageSize: 5,
      sortBy: 'Name' as const,
      sortDir: 'asc' as const,
    };

    service.getAllInstructors(params).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      'Trainer?page=1&pageSize=5&sortBy=Name&sortDir=asc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get instructor by ID', () => {
    const mockInstructor: ApiInstructor = {
      id: 1,
      name: 'أحمد محمد',
      title: 'مدرب تطوير الويب',
      mainSkill: 'JavaScript',
      numberOfCourses: 5,
      numberOfStudents: 120,
      starRanking: 4.5,
      about: 'مدرب محترف في تطوير الويب',
      channels: {
        linkedin: ['https://linkedin.com/in/ahmed'],
        email: ['ahmed@example.com'],
      },
    };

    service.getInstructorById(1).subscribe((instructor) => {
      expect(instructor).toEqual(mockInstructor);
    });

    const req = httpMock.expectOne('Trainer/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockInstructor);
  });

  it('should transform API instructor to UI instructor', () => {
    const apiInstructor: ApiInstructor = {
      id: 1,
      name: 'أحمد محمد',
      title: 'مدرب تطوير الويب',
      mainSkill: 'JavaScript',
      numberOfCourses: 5,
      numberOfStudents: 120,
      starRanking: 4.5,
      about: 'مدرب محترف في تطوير الويب',
      channels: {
        linkedin: ['https://linkedin.com/in/ahmed'],
        email: ['ahmed@example.com'],
      },
    };

    const uiInstructor =
      service.transformApiInstructorToUiInstructor(apiInstructor);

    expect(uiInstructor.id).toBe(1);
    expect(uiInstructor.name).toBe('أحمد محمد');
    expect(uiInstructor.title).toBe('مدرب تطوير الويب');
    expect(uiInstructor.mainSkill).toBe('JavaScript');
    expect(uiInstructor.numberOfCourses).toBe(5);
    expect(uiInstructor.numberOfStudents).toBe(120);
    expect(uiInstructor.starRanking).toBe(4.5);
    expect(uiInstructor.about).toBe('مدرب محترف في تطوير الويب');
    expect(uiInstructor.channels).toEqual(apiInstructor.channels);
    expect(uiInstructor.avatar).toBe('assets/img/instructor-avatar.png');
    expect(uiInstructor.isFeatured).toBe(true);
  });

  it('should transform API instructor response to UI instructors', () => {
    const apiResponse: ApiInstructorResponse = {
      data: [
        {
          id: 1,
          name: 'أحمد محمد',
          title: 'مدرب تطوير الويب',
          mainSkill: 'JavaScript',
          numberOfCourses: 5,
          numberOfStudents: 120,
          starRanking: 4.5,
          about: 'مدرب محترف في تطوير الويب',
          channels: {
            linkedin: ['https://linkedin.com/in/ahmed'],
            email: ['ahmed@example.com'],
          },
        },
      ],
      count: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
    };

    const uiInstructors =
      service.transformApiInstructorResponseToUiInstructors(apiResponse);

    expect(uiInstructors.length).toBe(1);
    expect(uiInstructors[0].id).toBe(1);
    expect(uiInstructors[0].name).toBe('أحمد محمد');
    expect(uiInstructors[0].isFeatured).toBe(true);
  });
});
