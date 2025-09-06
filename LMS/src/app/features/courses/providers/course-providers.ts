import { Provider } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

// Custom services
import { DialogService as CustomDialogService } from '../services/dialog.service';
import { ToastService } from '../services/toast.service';
import { EnrollmentDeleteService } from '../services/enrollment-delete.service';

export const COURSE_PROVIDERS: Provider[] = [
  // PrimeNG services
  DialogService,
  MessageService,

  // Custom services
  CustomDialogService,
  ToastService,
  EnrollmentDeleteService,
];
