import { Injectable, inject } from '@angular/core';
import { DialogService as PrimeDialogService } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import {
  ConfirmDeleteDialogComponent,
  ConfirmDeleteData,
} from '../components/confirm-delete-dialog/confirm-delete-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialog = inject(PrimeDialogService);

  /**
   * Show confirmation dialog for deleting a course
   */
  confirmDeleteCourse(courseName: string): Observable<boolean> {
    const data: ConfirmDeleteData = {
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من أنك تريد إلغاء التسجيل في هذه الدورة؟',
      courseName: courseName,
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: data,
      closable: false,
    });

    return dialogRef.onClose;
  }

  /**
   * Show confirmation dialog for general delete action
   */
  confirmDelete(
    title: string,
    message: string,
    itemName?: string
  ): Observable<boolean> {
    const data: ConfirmDeleteData = {
      title: title,
      message: message,
      courseName: itemName,
    };

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: data,
      closable: false,
    });

    return dialogRef.onClose;
  }
}
