import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { EnrollmentService, EnrollmentResponse } from './enrollment.service';
import { DialogService } from './dialog.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentDeleteService {
  private enrollmentService = inject(EnrollmentService);
  private dialogService = inject(DialogService);
  private toastService = inject(ToastService);

  /**
   * Unenroll from a course with confirmation dialog
   */
  unenrollFromCourseWithConfirmation(
    enrollmentId: number,
    courseName?: string
  ): Observable<EnrollmentResponse> {
    const courseTitle = courseName || 'هذه الدورة';

    return this.dialogService.confirmDeleteCourse(courseTitle).pipe(
      switchMap((confirmed) => {
        if (confirmed) {
          return this.enrollmentService.unenrollFromCourse(enrollmentId);
        } else {
          // User cancelled, return a cancelled response
          return of({
            success: false,
            message: 'تم إلغاء العملية',
            data: null,
          } as EnrollmentResponse);
        }
      })
    );
  }
}
