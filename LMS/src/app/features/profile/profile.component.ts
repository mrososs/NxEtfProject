import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from './services/profile.service';
import {
  EnrollmentService,
  Enrollment,
} from '../courses/services/enrollment.service';
import { EnrollmentDeleteService } from '../courses/services/enrollment-delete.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { COURSE_PROVIDERS } from '../courses/providers/course-providers';
import {
  Profile,
  Education,
  Experience,
  Skill,
  Contact,
} from './model/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    FileUploadModule,
    TabViewModule,
    CalendarModule,
    DropdownModule,
    BannerComponent,
  ],
  providers: [MessageService, ...COURSE_PROVIDERS],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  userCourses: any[] = [];
  enrolledCourses: Enrollment[] = [];
  enrollmentLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  currentProfile: Profile | null = null;

  // Contact types for dropdown
  contactTypes = [
    { label: 'البريد الإلكتروني', value: 'email' },
    { label: 'رقم الهاتف', value: 'phone' },
    { label: 'لينكد إن', value: 'linkedin' },
    { label: 'تويتر', value: 'twitter' },
    { label: 'فيسبوك', value: 'facebook' },
    { label: 'إنستجرام', value: 'instagram' },
    { label: 'موقع شخصي', value: 'website' },
    { label: 'أخرى', value: 'other' },
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private enrollmentService: EnrollmentService,
    private enrollmentDeleteService: EnrollmentDeleteService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      educations: this.fb.array([], this.minArrayLength(1)),
      experiences: this.fb.array([]),
      skills: this.fb.array([]),
      contacts: this.fb.array([]),
    });
  }
  private returnUrl: string | null = null;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.loadUserProfile();
  }

  // FormArray getters
  get educationsArray(): FormArray {
    return this.profileForm.get('educations') as FormArray;
  }

  get experiencesArray(): FormArray {
    return this.profileForm.get('experiences') as FormArray;
  }

  get skillsArray(): FormArray {
    return this.profileForm.get('skills') as FormArray;
  }

  get contactsArray(): FormArray {
    return this.profileForm.get('contacts') as FormArray;
  }

  /**
   * Check if we're currently preventing API calls due to recent redirect
   */
  isInRedirectPreventionMode(): boolean {
    return this.profileService.isInRedirectPreventionMode();
  }

  /**
   * Check if we're currently preventing API calls due to 500 error
   */
  isIn500ErrorMode(): boolean {
    return this.profileService.isIn500ErrorMode();
  }

  /**
   * Load user profile with redirect prevention handling
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.enrollmentLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        if (this.isProfileValid(profile)) {
          this.currentProfile = profile;
          this.isEditMode = false;

          if (profile.imageLink) {
            this.imagePreview = profile.imageLink; // أو this.getProfileImageUrl(...)
          }

          // الكورسات والإنرولمنت زي ما هي...
          this.userCourses = Array.isArray(profile.courses)
            ? profile.courses
            : [];
          if (
            Array.isArray(profile.enrollements) &&
            profile.enrollements.length
          ) {
            this.enrolledCourses = profile.enrollements;
          } else {
            this.enrolledCourses = [];
            this.loadEnrolledCoursesFromService();
          }
        } else {
          // أول مرة / بروفايل ناقص
          this.isEditMode = true;
          this.currentProfile = null;
          this.profileForm.reset();
          this.userCourses = [];
          this.enrolledCourses = [];

          // رسالة “أول مرة”
          this.messageService.add({
            severity: 'info',
            summary: 'معلومات',
            detail: 'يجب إنشاء الملف الشخصي الخاص بك لاستخدام موقع الكورسات',
          });
        }
        this.isLoading = false;
        this.enrollmentLoading = false;
      },
      error: (error) => {
        // اعتبرها “أول مرة” برضه
        this.isEditMode = true;
        this.currentProfile = null;
        this.profileForm.reset();
        this.userCourses = [];
        this.enrolledCourses = [];
        this.isLoading = false;
        this.enrollmentLoading = false;

        // لو 500 اعرض التحذير الإضافي
        this.messageService.add({
          severity: error.status === 500 ? 'warn' : 'info',
          summary: error.status === 500 ? 'تنبيه' : 'معلومات',
          detail:
            error.status === 500
              ? 'حدث خطأ في الخادم. يمكنك إدخال بيانات الملف الشخصي الآن وسيتم حفظها عند عودة الخادم للعمل.'
              : 'يجب إنشاء الملف الشخصي الخاص بك لاستخدام موقع الكورسات',
        });
      },
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showValidationError();
      return;
    }

    this.isLoading = true;
    const formData = this.buildFormData();
    this.submitProfileData(formData);
  }

  /**
   * Check if form is valid
   * @returns True if form is valid
   */
  private isFormValid(): boolean {
    return this.profileForm.valid;
  }

  /**
   * Show validation error message
   */
  private showValidationError(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'تحذير',
      detail: 'يرجى ملء جميع الحقول المطلوبة',
    });
  }

  /**
   * Build FormData object for API submission
   * @returns FormData object
   */
  private buildFormData(): FormData {
    const formData = new FormData();

    // Add basic profile information
    this.addBasicProfileData(formData);

    // Add image if selected
    this.addImageData(formData);

    // Add all sections data (always send arrays, even if empty)
    this.addSectionsData(formData);

    return formData;
  }

  /**
   * Add basic profile data to FormData
   * @param formData - FormData object
   */
  private addBasicProfileData(formData: FormData): void {
    const basicFields = [
      {
        key: 'FirstName',
        value: this.profileForm.get('firstName')?.value || '',
      },
      {
        key: 'MiddleName',
        value: this.profileForm.get('middleName')?.value || '',
      },
      { key: 'LastName', value: this.profileForm.get('lastName')?.value || '' },
      {
        key: 'Description',
        value: this.profileForm.get('description')?.value || '',
      },
    ];

    basicFields.forEach((field) => {
      formData.append(field.key, field.value);
    });
  }

  /**
   * Add image data to FormData if available
   * @param formData - FormData object
   */
  private addImageData(formData: FormData): void {
    if (this.selectedImage) {
      formData.append('Image', this.selectedImage);
    }
  }

  /**
   * Add all sections data to FormData
   * @param formData - FormData object
   */
  private addSectionsData(formData: FormData): void {
    // Add education data
    const educations = this.prepareEducationsData();
    educations.forEach((education, index) => {
      Object.keys(education).forEach((key) => {
        formData.append(`Educations[${index}].${key}`, education[key]);
      });
    });

    // Add experience data
    const experiences = this.prepareExperiencesData();
    experiences.forEach((experience, index) => {
      Object.keys(experience).forEach((key) => {
        formData.append(`Experiences[${index}].${key}`, experience[key]);
      });
    });

    // Add skills data
    const skills = this.prepareSkillsData();
    skills.forEach((skill, index) => {
      Object.keys(skill).forEach((key) => {
        formData.append(`Skills[${index}].${key}`, skill[key]);
      });
    });

    // Add contacts data
    const contacts = this.prepareContactsData();
    contacts.forEach((contact, index) => {
      Object.keys(contact).forEach((key) => {
        formData.append(`Contacts[${index}].${key}`, contact[key]);
      });
    });
  }

  /**
   * Submit profile data to API
   * @param formData - FormData object
   */
  private submitProfileData(formData: FormData): void {
    this.profileService.postProfile(formData).subscribe({
      next: (response) => this.handleSubmissionSuccess(response),
      error: (error) => this.handleSubmissionError(error),
    });
  }

  /**
   * Handle successful profile submission
   * @param response - API response
   */
  private handleSubmissionSuccess(response: any): void {
    // حدّث الـ currentProfile فورًا لو الـ API بيرجع البروفايل
    if (response) {
      this.currentProfile = {
        ...(this.currentProfile || {}),
        ...response,
      };
    }

    // Save user name to localStorage for homepage display
    this.saveUserDataToLocalStorage();

    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: this.isEditMode
        ? 'تم تحديث الملف الشخصي بنجاح'
        : 'تم إنشاء الملف الشخصي بنجاح',
    });

    // Reset redirect flags to allow normal API calls again
    this.profileService.resetRedirectFlags();

    // (اختياري) تجديد الداتا من السيرفر
    this.refreshProfileData();

    // عرض وضع المشاهدة
    this.isEditMode = false;
    this.isLoading = false;

    // ✅ توجيه بدون Reload:
    const target =
      this.returnUrl && this.returnUrl !== '/profile'
        ? this.returnUrl
        : '/homepage';

    // مهلة بسيطة لعرض التوست
    setTimeout(() => {
      this.router.navigateByUrl(target);
    }, 800);
  }
  private isProfileValid(p: any): boolean {
    return !!(p && p.firstName && p.lastName);
  }
  get hasValidProfile(): boolean {
    return this.isProfileValid(this.currentProfile);
  }

  /**
   * Handle profile submission error
   * @param error - Error object
   */
  private handleSubmissionError(error: any): void {
    console.error('Profile operation failed:', error);
    this.isLoading = false;

    // Handle different error types with specific messages
    if (error.status === 500) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail:
          'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى أو التأكد من صحة البيانات',
      });
    } else if (error.status === 401 || error.status === 403) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ في المصادقة',
        detail: 'يرجى إعادة تسجيل الدخول',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'حدث خطأ أثناء حفظ الملف الشخصي',
      });
    }
  }

  /**
   * Save user data to localStorage
   */
  private saveUserDataToLocalStorage(): void {
    const firstName = this.profileForm.get('firstName')?.value;
    const lastName = this.profileForm.get('lastName')?.value;

    if (firstName && lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      localStorage.setItem('userFullName', fullName);
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      console.log(
        'User name saved to localStorage after profile update:',
        fullName
      );
    }

    // Save profile image to localStorage
    if (this.currentProfile?.imageLink) {
      localStorage.setItem('userProfileImage', this.currentProfile.imageLink);
      console.log('User profile image saved to localStorage');
    }
  }

  /**
   * Refresh profile data from cache
   */
  private refreshProfileData(): void {
    this.profileService.refreshProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.currentProfile = profile;

          // Update form with fresh data
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            middleName: profile.middleName || '',
            lastName: profile.lastName || '',
            description: profile.description || '',
          });

          // Update courses data
          if (profile.courses && Array.isArray(profile.courses)) {
            this.userCourses = profile.courses;
            console.log('User courses refreshed:', this.userCourses);
          }

          // Update enrolled courses data
          if (profile.enrollements && Array.isArray(profile.enrollements)) {
            this.enrolledCourses = profile.enrollements;
            console.log('Enrolled courses refreshed:', this.enrolledCourses);
          } else {
            this.enrolledCourses = [];
          }
        }
      },
      error: (error) => {
        console.error('Error refreshing profile:', error);
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        return `يجب أن يكون الحقل على الأقل ${field.errors['minlength'].requiredLength} أحرف`;
      }
    }
    return '';
  }

  /**
   * Validator to check minimum length of FormArray
   */
  minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormArray) {
        return control.length >= min
          ? null
          : {
              minArrayLength: {
                requiredLength: min,
                actualLength: control.length,
              },
            };
      }
      return null;
    };
  }

  /**
   * Handle image selection
   */
  onImageSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'يرجى اختيار ملف صورة صحيح',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت',
        });
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.messageService.add({
        severity: 'success',
        summary: 'نجح',
        detail: 'تم اختيار الصورة بنجاح',
      });
    }
  }

  /**
   * Remove selected image
   */
  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.messageService.add({
      severity: 'info',
      summary: 'تم',
      detail: 'تم إزالة الصورة',
    });
  }

  /**
   * Load enrolled courses
   */
  loadEnrolledCourses(): void {
    this.enrollmentLoading = true;
    this.enrollmentService.getEnrolledCourses().subscribe({
      next: (enrollments) => {
        this.enrolledCourses = enrollments;
        this.enrollmentLoading = false;
        console.log('Enrolled courses loaded:', enrollments);
      },
      error: (error) => {
        console.error('Error loading enrolled courses:', error);
        this.enrollmentLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ في تحميل الدورات المسجلة',
        });
      },
    });
  }

  /**
   * Load enrolled courses from enrollment service (private method)
   */
  private loadEnrolledCoursesFromService(): void {
    this.enrollmentLoading = true;
    this.enrollmentService.getEnrolledCourses().subscribe({
      next: (enrollments) => {
        this.enrolledCourses = enrollments;
        this.enrollmentLoading = false;
        console.log('Enrolled courses loaded from service:', enrollments);
      },
      error: (error) => {
        console.error('Error loading enrolled courses from service:', error);
        this.enrollmentLoading = false;
        // Don't show error message for this fallback call
      },
    });
  }

  /**
   * Delete enrollment from a course
   */
  deleteEnrollment(enrollmentId: number, courseName?: string): void {
    this.enrollmentDeleteService
      .unenrollFromCourseWithConfirmation(enrollmentId, courseName)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'نجح',
              detail: 'تم حذف التسجيل من الدورة بنجاح',
            });
            // Refresh enrolled courses
            this.loadEnrolledCourses();
          } else if (response.message === 'تم إلغاء العملية') {
            // User cancelled, no need to show error message
            console.log('User cancelled deletion');
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: response.message || 'حدث خطأ في حذف التسجيل',
            });
          }
        },
        error: (error) => {
          console.error('Error deleting enrollment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ في حذف التسجيل من الدورة',
          });
        },
      });
  }

  /**
   * Launch a course using the provided URL
   */
  launchCourse(launchUrl: string): void {
    if (launchUrl) {
      // Open course in new tab/window
      window.open(launchUrl, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'رابط الدورة غير متاح',
      });
    }
  }

  /**
   * Navigate to course details page
   */
  goToCourseDetails(courseId: number | undefined): void {
    if (courseId) {
      this.router.navigate(['/courses', courseId]);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'معرف الدورة غير متاح',
      });
    }
  }

  /**
   * Toggle between edit and view mode
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.loadProfileDataToForm();
    }
  }

  /**
   * Get full name from current profile
   */
  getFullName(): string {
    if (!this.currentProfile) return '';
    const parts = [
      this.currentProfile.firstName,
      this.currentProfile.middleName,
      this.currentProfile.lastName,
    ]
      .filter((part) => part && part.trim() !== '')
      .map((part) => part!.trim());
    return parts.join(' ');
  }

  /**
   * Load profile data to form
   */
  private loadProfileDataToForm(): void {
    if (!this.currentProfile) return;

    // Load basic information
    this.profileForm.patchValue({
      firstName: this.currentProfile.firstName || '',
      middleName: this.currentProfile.middleName || '',
      lastName: this.currentProfile.lastName || '',
      description: this.currentProfile.description || '',
    });

    // Load educations
    this.educationsArray.clear();
    if (
      this.currentProfile.educations &&
      Array.isArray(this.currentProfile.educations) &&
      this.currentProfile.educations.length > 0
    ) {
      this.currentProfile.educations.forEach((education) => {
        this.addEducation(education);
      });
    } else {
      // If no educations, add an empty one to force user to fill it
      this.addEducation();
    }

    // Load experiences
    this.experiencesArray.clear();
    if (
      this.currentProfile.experiences &&
      Array.isArray(this.currentProfile.experiences) &&
      this.currentProfile.experiences.length > 0
    ) {
      this.currentProfile.experiences.forEach((experience) => {
        this.addExperience(experience);
      });
    }

    // Load skills
    this.skillsArray.clear();
    if (
      this.currentProfile.skills &&
      Array.isArray(this.currentProfile.skills) &&
      this.currentProfile.skills.length > 0
    ) {
      this.currentProfile.skills.forEach((skill) => {
        this.addSkill(skill);
      });
    }

    // Load contacts
    this.contactsArray.clear();
    if (
      this.currentProfile.contacts &&
      Array.isArray(this.currentProfile.contacts) &&
      this.currentProfile.contacts.length > 0
    ) {
      this.currentProfile.contacts.forEach((contact) => {
        this.addContact(contact);
      });
    }
  }

  /**
   * Add education form group
   */
  addEducation(education?: any): void {
    const educationForm = this.fb.group({
      id: [education?.id || 0], // Add id field
      institute: [education?.institute || '', Validators.required],
      degree: [education?.degree || '', Validators.required],
      grade: [education?.grade || ''],
      specialization: [education?.specialization || ''],
    });
    this.educationsArray.push(educationForm);
  }

  /**
   * Remove education form group
   */
  removeEducation(index: number): void {
    this.educationsArray.removeAt(index);
  }

  /**
   * Add experience form group
   */
  addExperience(experience?: any): void {
    const experienceForm = this.fb.group({
      id: [experience?.id || 0], // Add id field
      employer: [experience?.employer || '', Validators.required],
      startDate: [
        experience?.startDate ? new Date(experience.startDate) : null,
        Validators.required,
      ],
      endDate: [experience?.endDate ? new Date(experience.endDate) : null],
      isCurrent: [experience?.isCurrent || false],
      description: [experience?.description || ''],
      role: [experience?.role || '', Validators.required],
    });
    this.experiencesArray.push(experienceForm);
  }

  /**
   * Remove experience form group
   */
  removeExperience(index: number): void {
    this.experiencesArray.removeAt(index);
  }

  /**
   * Add skill form group
   */
  addSkill(skill?: any): void {
    const skillForm = this.fb.group({
      id: [skill?.id || 0], // Add id field
      name: [skill?.name || '', Validators.required],
      description: [skill?.description || ''],
      proficiency: [skill?.proficiency || ''],
    });
    this.skillsArray.push(skillForm);
  }

  /**
   * Remove skill form group
   */
  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
  }

  /**
   * Add contact form group
   */
  addContact(contact?: any): void {
    const contactForm = this.fb.group({
      id: [contact?.id || 0], // Add id field
      contactType: [contact?.contactType || '', Validators.required],
      contactDetail: [contact?.contactDetail || '', Validators.required],
    });
    this.contactsArray.push(contactForm);
  }

  /**
   * Remove contact form group
   */
  removeContact(index: number): void {
    this.contactsArray.removeAt(index);
  }

  /**
   * Get contact type label for display
   * @param contactType - The contact type
   * @returns Display label
   */
  getContactTypeLabel(contactType: string): string {
    const type = this.contactTypes.find((t) => t.value === contactType);
    return type ? type.label : contactType;
  }

  /**
   * Get contact detail by type
   * @param contactType - The contact type to search for
   * @returns Contact detail or null if not found
   */
  getContactByType(contactType: string): string | null {
    if (!this.currentProfile?.contacts) return null;

    const contact = this.currentProfile.contacts.find(
      (c) => c.contactType === contactType
    );
    return contact ? contact.contactDetail : null;
  }

  /**
   * Get profile image URL by removing ~ and adding base URL
   * @param imageLink - The image link from backend
   * @returns Complete image URL or null
   */
  getProfileImageUrl(imageLink: string | null): string | null {
    if (!imageLink) return null;

    // Remove ~ from the beginning if it exists
    const cleanPath = imageLink.startsWith('~')
      ? imageLink.substring(1)
      : imageLink;

    // Add base URL
    const baseUrl =
      'https://etf-gtfrcrf9gaaceacg.centralus-01.azurewebsites.net';
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Prepare educations data for API submission
   * @returns Array of education objects or empty array
   */
  private prepareEducationsData(): any[] {
    const educations = this.educationsArray.value
      .filter((edu: any) => this.isEducationValid(edu))
      .map((edu: any, index: number) => ({
        id: edu.id || 0, // Add id: 0 for new items
        institute: edu.institute?.trim() || '',
        degree: edu.degree?.trim() || '',
        grade: edu.grade?.trim() || '',
        specialization: edu.specialization?.trim() || '',
      }));

    return educations;
  }

  /**
   * Prepare experiences data for API submission
   * @returns Array of experience objects or empty array
   */
  private prepareExperiencesData(): any[] {
    const experiences = this.experiencesArray.value
      .filter((exp: any) => this.isExperienceValid(exp))
      .map((exp: any, index: number) => ({
        id: exp.id || 0, // Add id: 0 for new items
        employer: exp.employer?.trim() || '',
        startDate: exp.startDate ? exp.startDate.toISOString() : null,
        endDate: exp.endDate ? exp.endDate.toISOString() : null,
        isCurrent: Boolean(exp.isCurrent),
        description: exp.description?.trim() || '',
        role: exp.role?.trim() || '',
      }));

    return experiences;
  }

  /**
   * Prepare skills data for API submission
   * @returns Array of skill objects or empty array
   */
  private prepareSkillsData(): any[] {
    const skills = this.skillsArray.value
      .filter((skill: any) => this.isSkillValid(skill))
      .map((skill: any, index: number) => ({
        id: skill.id || 0, // Add id: 0 for new items
        name: skill.name?.trim() || '',
        description: skill.description?.trim() || '',
        proficiency: skill.proficiency?.trim() || '',
      }));

    return skills;
  }

  /**
   * Prepare contacts data for API submission
   * @returns Array of contact objects or empty array
   */
  private prepareContactsData(): any[] {
    const contacts = this.contactsArray.value
      .filter((contact: any) => this.isContactValid(contact))
      .map((contact: any, index: number) => ({
        id: contact.id || 0, // Add id: 0 for new items
        contactType: contact.contactType || '',
        contactDetail: contact.contactDetail?.trim() || '',
      }));

    return contacts;
  }

  /**
   * Check if education object has valid data
   * @param education - Education object to validate
   * @returns True if education has valid data
   */
  private isEducationValid(education: any): boolean {
    return (
      education &&
      (education.institute?.trim() ||
        education.degree?.trim() ||
        education.grade?.trim() ||
        education.specialization?.trim())
    );
  }

  /**
   * Check if experience object has valid data
   * @param experience - Experience object to validate
   * @returns True if experience has valid data
   */
  private isExperienceValid(experience: any): boolean {
    return (
      experience &&
      (experience.employer?.trim() ||
        experience.startDate ||
        experience.endDate ||
        experience.description?.trim() ||
        experience.role?.trim())
    );
  }

  /**
   * Check if skill object has valid data
   * @param skill - Skill object to validate
   * @returns True if skill has valid data
   */
  private isSkillValid(skill: any): boolean {
    return (
      skill &&
      (skill.name?.trim() ||
        skill.description?.trim() ||
        skill.proficiency?.trim())
    );
  }

  /**
   * Check if contact object has valid data
   * @param contact - Contact object to validate
   * @returns True if contact has valid data
   */
  private isContactValid(contact: any): boolean {
    return contact && (contact.contactType || contact.contactDetail?.trim());
  }
}
