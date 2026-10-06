import { Injectable, signal } from '@angular/core';
import { ToastMessage, ToastType } from './toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'info', title?: string, duration: number = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, message, type, title, duration };

    this.toastsSignal.update((list) => [...list, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title?: string) {
    this.show(message, 'success', title || 'Operación Exitosa');
  }

  error(message: string, title?: string) {
    this.show(message, 'error', title || 'Error en la Solicitud');
  }

  warning(message: string, title?: string) {
    this.show(message, 'warning', title || 'Advertencia');
  }

  info(message: string, title?: string) {
    this.show(message, 'info', title || 'Información');
  }

  remove(id: string) {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }
}
