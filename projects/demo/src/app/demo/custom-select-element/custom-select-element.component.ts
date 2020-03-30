import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl
} from '@angular/forms';
import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-select-element',
  templateUrl: './custom-select-element.component.html',
  styleUrls: ['./custom-select-element.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomSelectElementComponent,
      multi: true
    }
  ]
})
export class CustomSelectElementComponent
  implements ControlValueAccessor, OnDestroy {
  @Input() label: string;
  @Input() options: { value: string; display: string }[];

  public control = new FormControl();
  private destroy = new Subject();

  constructor() {
    this.control.valueChanges
      .pipe(startWith(this.control.value), takeUntil(this.destroy))
      .subscribe(val => this.onChanged(val));
  }

  public disabled: boolean;

  onChanged: any = () => {};
  onTouched: any = () => {};

  writeValue(val) {
    this.control.setValue(val);
  }

  registerOnChange(fn: any) {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
