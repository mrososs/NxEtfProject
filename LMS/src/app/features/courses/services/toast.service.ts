import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail: message,
      life: 3000,
      key: 'bottom-right',
    });
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: message,
      life: 5000,
      key: 'bottom-right',
    });
  }

  /**
   * Show info message
   */
  showInfo(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'معلومات',
      detail: message,
      life: 3000,
      key: 'bottom-right',
    });
  }

  /**
   * Show warning message
   */
  showWarning(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'تحذير',
      detail: message,
      life: 4000,
      key: 'bottom-right',
    });
  }
}
