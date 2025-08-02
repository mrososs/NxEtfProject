import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-required-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      styleClass="profile-required-dialog"
      header="الملف الشخصي مطلوب"
      [style]="{ width: '400px' }"
    >
      <div class="dialog-content">
        <div class="icon-container">
          <i
            class="pi pi-user-edit"
            style="font-size: 3rem; color: #007bff;"
          ></i>
        </div>

        <h3 class="dialog-title">يجب إنشاء ملف شخصي أولاً</h3>

        <p class="dialog-message">
          لكي تتمكن من الوصول إلى هذه الصفحة والاستفادة من جميع الميزات، يجب
          عليك إنشاء ملف شخصي أولاً.
        </p>

        <div class="dialog-actions">
          <button
            pButton
            type="button"
            label="إنشاء ملف شخصي"
            icon="pi pi-user-plus"
            class="p-button-primary"
            (click)="onCreateProfile()"
          ></button>

          <button
            pButton
            type="button"
            label="إلغاء"
            icon="pi pi-times"
            class="p-button-secondary"
            (click)="onCancel()"
          ></button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      .dialog-content {
        text-align: center;
        padding: 1rem;
      }

      .icon-container {
        margin-bottom: 1rem;
      }

      .dialog-title {
        color: #333;
        margin-bottom: 1rem;
        font-size: 1.2rem;
      }

      .dialog-message {
        color: #666;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }

      .dialog-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .dialog-actions button {
        min-width: 120px;
      }

      :host ::ng-deep .profile-required-dialog .p-dialog-header {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      :host ::ng-deep .profile-required-dialog .p-dialog-content {
        padding: 0;
      }
    `,
  ],
})
export class ProfileRequiredDialogComponent {
  @Input() visible = false;
  @Output() createProfile = new EventEmitter<void>();
  @Output() cancelDialog = new EventEmitter<void>();

  constructor(private router: Router) {}

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  onCreateProfile(): void {
    this.hide();
    this.createProfile.emit();
    this.router.navigate(['/profile']);
  }

  onCancel(): void {
    this.hide();
    this.cancelDialog.emit();
  }
}
