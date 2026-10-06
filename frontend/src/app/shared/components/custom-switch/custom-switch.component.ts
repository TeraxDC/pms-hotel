import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSwitchComponent),
      multi: true
    }
  ],
  template: `
    <label
      class="inline-flex items-center gap-3 cursor-pointer select-none"
      [class.opacity-50]="disabled"
      [class.cursor-not-allowed]="disabled"
    >
      <div
        class="w-11 h-6 rounded-full transition-colors duration-200 ease-in-out p-0.5 relative"
        [ngClass]="{
          'bg-amber-600': checked && !disabled,
          'bg-slate-300': !checked && !disabled,
          'bg-slate-200': disabled
        }"
        (click)="toggle()"
      >
        <div
          class="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out"
          [ngClass]="{
            'translate-x-5': checked,
            'translate-x-0': !checked
          }"
        ></div>
      </div>

      <span *ngIf="label" class="text-sm font-medium text-slate-700 leading-none">
        {{ label }}
      </span>
      <ng-content></ng-content>
    </label>
  `
})
export class CustomSwitchComponent implements ControlValueAccessor {
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
