import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      <div
        *ngFor="let toast of toastService.toasts()"
        class="pointer-events-auto bg-white rounded-xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 transition-all animate-in slide-in-from-top-4 duration-200"
      >
        <!-- Icon based on type -->
        <div
          [ngClass]="{
            'bg-emerald-50 text-emerald-600 border-emerald-200': toast.type === 'success',
            'bg-red-50 text-red-600 border-red-200': toast.type === 'error',
            'bg-amber-50 text-amber-600 border-amber-200': toast.type === 'warning',
            'bg-blue-50 text-blue-600 border-blue-200': toast.type === 'info'
          }"
          class="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 mt-0.5"
        >
          <app-icon
            [name]="getIconName(toast.type)"
            [size]="16"
          ></app-icon>
        </div>

        <div class="flex-1 min-w-0">
          <h4
            *ngIf="toast.title"
            class="text-xs font-bold text-slate-900 tracking-wide mb-0.5"
          >
            {{ toast.title }}
          </h4>
          <p class="text-xs text-slate-600 leading-relaxed break-words">
            {{ toast.message }}
          </p>
        </div>

        <button
          type="button"
          (click)="toastService.remove(toast.id)"
          class="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <app-icon name="x" [size]="14"></app-icon>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIconName(type: string): string {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      default:
        return 'info';
    }
  }
}
