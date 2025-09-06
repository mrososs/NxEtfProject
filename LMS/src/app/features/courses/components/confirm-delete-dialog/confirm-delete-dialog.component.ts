import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

export interface ConfirmDeleteData {
  title: string;
  message: string;
  courseName?: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="confirm-dialog">
      <h2>{{ data.title }}</h2>

      <div class="dialog-content">
        <p>{{ data.message }}</p>
        <p *ngIf="data.courseName" class="course-name">
          <strong>{{ data.courseName }}</strong>
        </p>
      </div>

      <div class="dialog-actions">
        <p-button
          label="إلغاء"
          (onClick)="onCancel()"
          class="cancel-btn"
          severity="secondary"
        ></p-button>
        <p-button
          label="حذف"
          (onClick)="onConfirm()"
          class="confirm-btn"
          severity="danger"
        ></p-button>
      </div>
    </div>
  `,
  styles: [
    `
      .confirm-dialog {
        padding: 20px;
        min-width: 300px;
      }

      .dialog-content {
        margin: 20px 0;
      }

      .course-name {
        margin-top: 10px;
        padding: 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
        border-left: 4px solid #ff9800;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .confirm-btn {
        background-color: #f44336;
        color: white;
      }

      .confirm-btn:hover {
        background-color: #d32f2f;
      }
    `,
  ],
})
export class ConfirmDeleteDialogComponent {
  data: ConfirmDeleteData;

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.data = this.config.data;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
