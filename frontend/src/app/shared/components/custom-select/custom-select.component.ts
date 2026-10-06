import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export interface SelectOption {
  value: any;
  label: string;
  sublabel?: string;
  iconName?: string;
  badge?: {
    colorHex?: string;
    bgHex?: string;
    textHex?: string;
  };
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" #selectContainer>
      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleOpen()"
        [disabled]="disabled"
        class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        <div class="flex items-center gap-2 truncate">
          <app-icon
            *ngIf="selectedOption?.iconName"
            [name]="selectedOption!.iconName!"
            [size]="16"
            class="text-slate-500 shrink-0"
          ></app-icon>

          <span
            *ngIf="selectedOption?.badge"
            class="w-2.5 h-2.5 rounded-full shrink-0"
            [style.backgroundColor]="selectedOption?.badge?.colorHex || '#64748B'"
          ></span>

          <span class="truncate" *ngIf="selectedOption; else placeholderTpl">
            {{ selectedOption.label }}
          </span>
          <ng-template #placeholderTpl>
            <span class="text-slate-400">{{ placeholder }}</span>
          </ng-template>
        </div>

        <app-icon
          name="chevron-down"
          [size]="16"
          [className]="isOpen() ? 'rotate-180 transition-transform duration-200 text-amber-600' : 'text-slate-400 transition-transform duration-200'"
        ></app-icon>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen()"
        class="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl p-1.5 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
      >
        <!-- Search filter if searchEnabled -->
        <div *ngIf="searchable" class="px-2 pb-2 pt-1 border-b border-slate-100">
          <div class="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <app-icon name="search" [size]="14" class="text-slate-400"></app-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Buscar opción..."
              class="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
              (click)="$event.stopPropagation()"
            />
          </div>
        </div>

        <!-- Options List -->
        <div class="py-1">
          <button
            type="button"
            *ngFor="let opt of filteredOptions()"
            (click)="select(opt)"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer"
            [ngClass]="{
              'bg-amber-50 text-amber-900 font-semibold': opt.value === innerValue,
              'text-slate-700 hover:bg-slate-50': opt.value !== innerValue
            }"
          >
            <div class="flex items-center gap-2 truncate">
              <app-icon
                *ngIf="opt.iconName"
                [name]="opt.iconName"
                [size]="14"
                class="text-slate-500 shrink-0"
              ></app-icon>

              <span
                *ngIf="opt.badge"
                class="w-2.5 h-2.5 rounded-full shrink-0"
                [style.backgroundColor]="opt.badge.colorHex || '#64748B'"
              ></span>

              <div class="truncate">
                <div>{{ opt.label }}</div>
                <div *ngIf="opt.sublabel" class="text-[10px] text-slate-400 font-normal">
                  {{ opt.sublabel }}
                </div>
              </div>
            </div>

            <app-icon
              *ngIf="opt.value === innerValue"
              name="check"
              [size]="14"
              class="text-amber-600 shrink-0"
            ></app-icon>
          </button>

          <div
            *ngIf="filteredOptions().length === 0"
            class="px-3 py-3 text-center text-xs text-slate-400"
          >
            No se encontraron opciones
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() searchable: boolean = false;
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal<boolean>(false);
  searchQuery: string = '';
  innerValue: any = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  get selectedOption(): SelectOption | undefined {
    return this.options.find((o) => o.value === this.innerValue);
  }

  filteredOptions(): SelectOption[] {
    if (!this.searchQuery.trim()) {
      return this.options;
    }
    const q = this.searchQuery.toLowerCase();
    return this.options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }

  toggleOpen() {
    if (!this.disabled) {
      this.isOpen.update((v) => !v);
      if (this.isOpen()) {
        this.searchQuery = '';
      }
    }
  }

  select(option: SelectOption) {
    this.innerValue = option.value;
    this.onChange(this.innerValue);
    this.onTouched();
    this.selectionChange.emit(this.innerValue);
    this.isOpen.set(false);
  }

  writeValue(value: any): void {
    this.innerValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
