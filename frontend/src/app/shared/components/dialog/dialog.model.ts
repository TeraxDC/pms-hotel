export type DialogType = 'info' | 'warning' | 'danger' | 'success';

export interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
}
