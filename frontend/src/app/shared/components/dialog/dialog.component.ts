import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from './dialog.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      *ngIf="dialogService.dialogState() as state"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 scale-100 animate-in zoom-in-95 duration-150"
      >
        <!-- Icon Header based on Type -->
        <div class="flex items-center gap-3 mb-4">
          <div
            [ngClass]="{
              'bg-blue-50 text-blue-600 border-blue-200': state.options.type === 'info',
              'bg-amber-50 text-amber-600 border-amber-200': state.options.type === 'warning',
              'bg-red-50 text-red-600 border-red-200': state.options.type === 'danger',
              'bg-emerald-50 text-emerald-600 border-emerald-200': state.options.type === 'success'
            }"
            class="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0"
          >
            <app-icon
              [name]="getIconName(state.options.type)"
              [size]="22"
            ></app-icon>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 leading-tight">
              {{ state.options.title }}
            </h3>
          </div>
        </div>

        <!-- Message Body -->
        <p class="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">
          {{ state.options.message }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
          <button
            *ngIf="state.options.isConfirm"
            type="button"
            (click)="dialogService.close(false)"
            class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            {{ state.options.cancelText }}
          </button>

          <button
            type="button"
            (click)="dialogService.close(true)"
            [ngClass]="{
              'bg-slate-900 hover:bg-slate-800 text-white': state.options.type === 'info',
              'bg-amber-600 hover:bg-amber-700 text-white': state.options.type === 'warning',
              'bg-red-600 hover:bg-red-700 text-white': state.options.type === 'danger',
              'bg-emerald-600 hover:bg-emerald-700 text-white': state.options.type === 'success'
            }"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            {{ state.options.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class DialogContainerComponent {
  dialogService = inject(DialogService);

  getIconName(type?: string): string {
    switch (type) {
      case 'danger':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      case 'success':
        return 'check-circle';
      default:
        return 'info';
    }
  }
}
