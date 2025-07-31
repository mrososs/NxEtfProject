import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { Profile, ProfileResponse } from '../model/profile.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  const mockProfile: Profile = {
    id: 1,
    image: 'assets/img/instructor-avatar.png',
    imageLink: 'assets/img/instructor-avatar.png',
    firstName: 'احمد',
    middleName: 'ياسر',
    lastName: 'محمد',
    description: 'مرحباً، أنا احمد ياسر محمد، شغوف بالتعلم والتطوير.',
    user: {
      username: 'ahmed_yasser',
      email: 'ahmed@example.com',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get profile data (mock)', () => {
    service.getProfile().subscribe((profile) => {
      expect(profile).toBeDefined();
      expect(profile.firstName).toBe('احمد');
      expect(profile.middleName).toBe('ياسر');
      expect(profile.lastName).toBe('محمد');
    });
  });

  it('should update profile (mock)', () => {
    const updateData: Partial<Profile> = {
      firstName: 'محمد',
      lastName: 'أحمد',
    };

    service.updateProfile(updateData).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.data.firstName).toBe('محمد');
      expect(response.data.lastName).toBe('أحمد');
    });
  });

  it('should upload profile image (mock)', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    service.uploadProfileImage(mockFile).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.message).toBe('Image uploaded successfully');
    });
  });

  it('should get full name from profile', () => {
    const fullName = service.getFullName(mockProfile);
    expect(fullName).toBe('احمد ياسر محمد');
  });

  it('should get display name from profile', () => {
    const displayName = service.getDisplayName(mockProfile);
    expect(displayName).toBe('احمد محمد');
  });

  it('should handle empty name parts', () => {
    const profileWithEmptyParts: Profile = {
      ...mockProfile,
      middleName: '',
      lastName: '',
    };

    const fullName = service.getFullName(profileWithEmptyParts);
    expect(fullName).toBe('احمد');

    const displayName = service.getDisplayName(profileWithEmptyParts);
    expect(displayName).toBe('احمد');
  });

  it('should handle whitespace in name parts', () => {
    const profileWithWhitespace: Profile = {
      ...mockProfile,
      firstName: '  احمد  ',
      middleName: '  ياسر  ',
      lastName: '  محمد  ',
    };

    const fullName = service.getFullName(profileWithWhitespace);
    expect(fullName).toBe('احمد ياسر محمد');

    const displayName = service.getDisplayName(profileWithWhitespace);
    expect(displayName).toBe('احمد محمد');
  });
});
