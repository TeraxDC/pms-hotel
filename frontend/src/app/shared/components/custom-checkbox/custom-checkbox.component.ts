import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-custom-checkbox',
  standalone: true,
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label
      class="inline-flex items-center gap-2.5 cursor-pointer select-none"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled"
    >
      <div
        class="w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 shadow-2xs"
        [ngClass]="{
          'bg-slate-900 border-slate-900 text-white': checked && !disabled,
          'bg-white border-slate-300 text-transparent hover:border-slate-400': !checked && !disabled,
          'bg-slate-100 border-slate-200': disabled
        }"
        (click)="toggle()"
      >
        <app-icon
          *ngIf="checked"
          name="check"
          [size]="13"
          className="stroke-[3]"
        ></app-icon>
      </div>

      <span *ngIf="label" class="text-sm font-medium text-slate-700 leading-none">
        {{ label }}
      </span>
      <ng-content></ng-content>
    </label>
  `
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled: boolean = false;

  checked: boolean = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle() {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
    }
  }

  writeValue(value: boolean): void {
    this.checked = !!value;
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
