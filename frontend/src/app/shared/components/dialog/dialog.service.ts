import { Injectable, signal } from '@angular/core';
import { DialogOptions } from './dialog.model';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private activeDialog = signal<{
    options: DialogOptions;
    resolve: (result: boolean) => void;
  } | null>(null);

  dialogState = this.activeDialog.asReadonly();

  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.activeDialog.set({
        options: {
          ...options,
          isConfirm: true,
          confirmText: options.confirmText || 'Aceptar',
          cancelText: options.cancelText || 'Cancelar',
          type: options.type || 'warning'
        },
        resolve
      });
    });
  }

  alert(title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info'): Promise<boolean> {
    return new Promise((resolve) => {
      this.activeDialog.set({
        options: {
          title,
          message,
          type,
          isConfirm: false,
          confirmText: 'Entendido'
        },
        resolve
      });
    });
  }

  close(result: boolean) {
    const current = this.activeDialog();
    if (current) {
      current.resolve(result);
      this.activeDialog.set(null);
    }
  }
}
