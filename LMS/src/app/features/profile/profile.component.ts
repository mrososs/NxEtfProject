import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { PaginatorModule } from 'primeng/paginator';
import { PrimeIcons } from 'primeng/api';
import { ProfileService } from './services/profile.service';
import { Profile, User } from './model/profile.model';
import { Course } from '../courses/model/course.model';
import { HomePageService } from '../courses/services/home-page.service';

interface UserCourse {
  id: number;
  title: string;
  image: string;
  level: string;
  instructor: string;
  lectures: number;
  rating: number;
  reviews: number;
  progress: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FileUploadModule,
    PaginatorModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private _profileService = inject(ProfileService);
  private _homePageService = inject(HomePageService);

  profile!: Profile;
  loading = true;
  error = false;
  editing = false;
  uploadingImage = false;

  // Form data for editing
  editForm = {
    firstName: '',
    middleName: '',
    lastName: '',
    description: '',
  };

  // User courses data
  userCourses: UserCourse[] = [
    {
      id: 1,
      title: 'التعامل مع الثقافات المختلفة',
      image: 'assets/img/courses/culture.jpg',
      level: 'مبتدئ',
      instructor: 'احمد',
      lectures: 20,
      rating: 4.5,
      reviews: 9000,
      progress: 75,
    },
    {
      id: 2,
      title: 'تنظيم الفعاليات السياحية',
      image: 'assets/img/courses/events.jpg',
      level: 'مبتدئ',
      instructor: 'احمد',
      lectures: 20,
      rating: 4.5,
      reviews: 9000,
      progress: 60,
    },
    {
      id: 3,
      title: 'إدارة وكالات السفر',
      image: 'assets/img/courses/travel.jpg',
      level: 'مبتدئ',
      instructor: 'احمد',
      lectures: 20,
      rating: 4.5,
      reviews: 9000,
      progress: 45,
    },
  ];

  // Pagination
  currentPage = 1;
  pageSize = 3;
  totalRecords = this.userCourses.length;

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = false;

    this._profileService.getProfile().subscribe({
      next: (profile: Profile) => {
        this.profile = profile;
        this.initializeEditForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  private initializeEditForm(): void {
    this.editForm = {
      firstName: this.profile.firstName,
      middleName: this.profile.middleName,
      lastName: this.profile.lastName,
      description: this.profile.description,
    };
  }

  /**
   * Get full name from profile
   */
  getFullName(): string {
    return this._profileService.getFullName(this.profile);
  }

  /**
   * Get display name (first and last name only)
   */
  getDisplayName(): string {
    return this._profileService.getDisplayName(this.profile);
  }

  /**
   * Start editing profile
   */
  startEditing(): void {
    this.editing = true;
  }

  /**
   * Cancel editing
   */
  cancelEditing(): void {
    this.editing = false;
    this.initializeEditForm();
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (this.validateForm()) {
      const updatedProfile: Partial<Profile> = {
        firstName: this.editForm.firstName,
        middleName: this.editForm.middleName,
        lastName: this.editForm.lastName,
        description: this.editForm.description,
      };

      this._profileService.updateProfile(updatedProfile).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.profile = { ...this.profile, ...updatedProfile };
          this.editing = false;
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          // For demo purposes, update locally
          this.profile = { ...this.profile, ...updatedProfile };
          this.editing = false;
        },
      });
    }
  }

  /**
   * Validate edit form
   */
  private validateForm(): boolean {
    return !!(this.editForm.firstName && this.editForm.lastName);
  }

  /**
   * Handle image upload
   */
  onImageUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      this.uploadingImage = true;

      this._profileService.uploadProfileImage(file).subscribe({
        next: (response) => {
          console.log('Image uploaded successfully:', response);
          this.profile.image = response.data.image;
          this.profile.imageLink = response.data.imageLink;
          this.uploadingImage = false;
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.uploadingImage = false;
          // For demo purposes, update locally
          this.profile.image = URL.createObjectURL(file);
        },
      });
    }
  }

  /**
   * Get paginated courses
   */
  getPaginatedCourses(): UserCourse[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.userCourses.slice(startIndex, endIndex);
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage = event.page + 1;
  }

  /**
   * Start course
   */
  startCourse(courseId: number): void {
    console.log('Starting course:', courseId);
    // Navigate to course details
    window.location.href = `/courses/${courseId}`;
  }

  /**
   * Get progress color based on percentage
   */
  getProgressColor(progress: number): string {
    if (progress >= 80) return '#28a745';
    if (progress >= 60) return '#ffc107';
    if (progress >= 40) return '#fd7e14';
    return '#dc3545';
  }

  /**
   * Get progress status text
   */
  getProgressStatus(progress: number): string {
    if (progress >= 100) return 'مكتملة';
    if (progress >= 80) return 'قريبة من الاكتمال';
    if (progress >= 60) return 'في التقدم';
    if (progress >= 40) return 'مبتدئة';
    return 'لم تبدأ بعد';
  }
}
