import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-2xs transition-colors"
      [style.backgroundColor]="bgHex || '#F1F5F9'"
      [style.color]="textHex || '#334155'"
      [style.borderColor]="colorHex ? colorHex + '40' : '#E2E8F0'"
    >
      <!-- Indicator Dot or SVG Icon -->
      <app-icon
        *ngIf="iconName"
        [name]="iconName"
        [size]="12"
        [style.color]="colorHex || textHex"
      ></app-icon>

      <span
        *ngIf="!iconName && colorHex"
        class="w-2 h-2 rounded-full shrink-0"
        [style.backgroundColor]="colorHex"
      ></span>

      <span>{{ text }}</span>
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() text: string = '';
  @Input() colorHex: string = '';
  @Input() bgHex: string = '';
  @Input() textHex: string = '';
  @Input() iconName: string = '';
}
