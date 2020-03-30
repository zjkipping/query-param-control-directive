import {
  Directive,
  Input,
  HostListener,
  OnInit,
  ElementRef,
  Renderer2,
  Optional,
  OnDestroy,
  QueryList,
  ContentChildren,
  AfterContentInit
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, merge, fromEvent } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';

import { decodeValueFromUrl } from './utility';
import { QueryParamControlService } from './query-param-control.service';

// Need a 2nd directive for these checkbox inputs in a group until this is implemented: https://github.com/angular/angular/issues/8563
@Directive({
  selector: '[queryParamCheckbox]'
})
export class CheckboxQueryParamControlDirective {}

@Directive({
  selector: '[queryParamControl]'
})
export class QueryParamControlDirective
  implements OnInit, AfterContentInit, OnDestroy {
  @Input() readonly paramKey = '';
  @Input() readonly checkboxGroup = false;
  @Input() mergeParam(value: boolean) {
    this.queryParamsHandling = value ? 'merge' : 'preserve';
  }

  // if https://github.com/angular/angular/issues/8563 ever gets implemented convert this query selector to 'input[type="checkbox"]'
  @ContentChildren(CheckboxQueryParamControlDirective, {
    descendants: true,
    read: ElementRef
  })
  private readonly checkboxInputs: QueryList<ElementRef> | undefined;
  private destroyCheckboxInputsChanges: Subject<void> | undefined;

  private queryParamsHandling: 'merge' | 'preserve' = 'merge';

  private isCheckbox = false;
  private isReactiveControl = false;

  private destroy: Subject<void> = new Subject();

  @HostListener('input') inputValueChange() {
    if (!this.isReactiveControl) {
      let value: any;
      if (this.isCheckbox) {
        value = this.elRef.nativeElement.checked;
      } else {
        value = this.elRef.nativeElement.value;
      }
      this.qpcs.setQueryParam(value, this.paramKey, this.queryParamsHandling);
    }
  }

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly qpcs: QueryParamControlService,
    @Optional() private reactiveControl: NgControl
  ) {
    this.isReactiveControl = !!this.reactiveControl;
  }

  ngOnInit() {
    if (!this.paramKey) {
      throw new Error(
        `Input of \`paramKey\` is required for Query Param Control Directive on element: ${this.elRef.nativeElement.outerHTML}`
      );
    }

    if (!this.checkboxGroup) {
      this.isCheckbox = this.elRef.nativeElement.type === 'checkbox';
      const initalQueryParamValue = this.qpcs.getInitalParamValue(
        this.paramKey
      );

      if (!!initalQueryParamValue) {
        const value = decodeValueFromUrl(initalQueryParamValue);
        if (this.isReactiveControl) {
          this.reactiveControl.control.setValue(value);
        } else if (this.isCheckbox) {
          this.renderer.setProperty(this.elRef.nativeElement, 'checked', value);
        } else {
          this.renderer.setProperty(this.elRef.nativeElement, 'value', value);
        }
      } else {
        if (this.isReactiveControl) {
          this.qpcs.setQueryParam(
            this.reactiveControl.control.value,
            this.paramKey,
            this.queryParamsHandling
          );
        } else if (this.isCheckbox) {
          this.qpcs.setQueryParam(
            this.elRef.nativeElement.checked,
            this.paramKey,
            this.queryParamsHandling
          );
        } else {
          this.qpcs.setQueryParam(
            this.elRef.nativeElement.value,
            this.paramKey,
            this.queryParamsHandling
          );
        }
      }

      if (this.isReactiveControl) {
        this.reactiveControl.control.valueChanges
          .pipe(takeUntil(this.destroy))
          .subscribe(value =>
            this.qpcs.setQueryParam(
              value,
              this.paramKey,
              this.queryParamsHandling
            )
          );
      }
    }
  }

  ngAfterContentInit() {
    const initalQueryParamValue = this.qpcs.getInitalParamValue(this.paramKey);

    if (this.checkboxGroup && this.checkboxInputs) {
      if (!!initalQueryParamValue) {
        const value = decodeValueFromUrl(initalQueryParamValue);
        this.checkboxInputs.forEach(checkboxInput =>
          this.renderer.setProperty(
            checkboxInput.nativeElement,
            'checked',
            value.includes(checkboxInput.nativeElement.value)
          )
        );
      } else {
        const values = convertCheckboxInputsToValueArray(this.checkboxInputs);
        this.qpcs.setQueryParam(
          values.length > 0 ? values : undefined,
          this.paramKey,
          this.queryParamsHandling
        );
      }

      this.checkboxInputs.changes
        .pipe(
          startWith(this.checkboxInputs),
          switchMap(() => {
            if (this.destroyCheckboxInputsChanges) {
              this.destroyCheckboxInputsChanges.next();
              this.destroyCheckboxInputsChanges.complete();
            }
            this.destroyCheckboxInputsChanges = new Subject();
            return merge(
              ...this.checkboxInputs.map(checkboxInput =>
                fromEvent(checkboxInput.nativeElement, 'input').pipe(
                  takeUntil(this.destroyCheckboxInputsChanges)
                )
              )
            ).pipe(takeUntil(this.destroyCheckboxInputsChanges));
          }),
          takeUntil(this.destroy)
        )
        .subscribe(() => {
          const values = convertCheckboxInputsToValueArray(this.checkboxInputs);
          this.qpcs.setQueryParam(
            values.length > 0 ? values : undefined,
            this.paramKey,
            this.queryParamsHandling
          );
        });
    }
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();

    if (!!this.destroyCheckboxInputsChanges) {
      this.destroyCheckboxInputsChanges.next();
      this.destroyCheckboxInputsChanges.complete();
    }
  }
}

function convertCheckboxInputsToValueArray(
  checkboxInputs: QueryList<ElementRef>
) {
  return checkboxInputs.reduce((checkboxesValue, checkboxInput) => {
    if (!!checkboxInput.nativeElement.checked) {
      checkboxesValue.push(checkboxInput.nativeElement.value);
    }
    return checkboxesValue;
  }, []);
}
