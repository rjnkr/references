import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="confirm-title">
      <mat-icon [class.confirm-title__icon--danger]="data.destructive">
        {{ data.destructive ? 'warning' : 'help_outline' }}
      </mat-icon>
      <span>{{ data.title }}</span>
    </h2>
    <mat-dialog-content>
      <p class="confirm-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close(false)">
        {{ data.cancelLabel ?? 'Cancel' }}
      </button>
      <button
        mat-flat-button
        type="button"
        [color]="data.destructive ? 'warn' : 'primary'"
        [class.confirm-danger]="data.destructive"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .confirm-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.05rem !important;
        font-weight: 700 !important;
      }

      .confirm-title__icon--danger {
        color: #b3261e;
      }

      .confirm-message {
        margin: 0;
        font-size: 0.9rem;
        color: var(--tidalis-text);
        max-width: 44ch;
      }

      .confirm-danger {
        --mdc-filled-button-container-color: #b3261e;
        --mdc-filled-button-label-text-color: #fff;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
