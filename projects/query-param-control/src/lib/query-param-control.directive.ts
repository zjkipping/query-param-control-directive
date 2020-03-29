import {
  Directive,
  Input,
  HostListener,
  OnInit,
  ElementRef,
  Renderer2,
  Optional,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { decodeValueFromUrl } from './utility';

@Directive({
  selector: '[queryParamControl]'
})
export class QueryParamControlDirective implements OnInit, OnDestroy {
  @Input() readonly paramKey = '';
  @Input() readonly mergeParam = true;

  private isReactiveControl = false;
  private isCheckbox = false;
  private destroy: Subject<void> | undefined;
  private readonly noRoutingSetup: boolean;

  @HostListener('input') inputValueChange() {
    if (!this.isReactiveControl) {
      let value: any;
      if (this.isCheckbox) {
        value = this.getCheckBoxesValueForParams();
      } else {
        value = this.elRef.nativeElement.value;
      }
      this.setQueryParam(value);
    }
  }

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2,
    @Optional() private readonly router: Router,
    @Optional() private readonly route: ActivatedRoute,
    @Optional() private reactiveControl: NgControl
  ) {
    this.noRoutingSetup = !this.router || !this.route;
    if (this.noRoutingSetup) {
      throw new Error(
        `No routing setup could be found for the application. You will need to setup & define the RouterModule in your application to make use of the \`queryParamControl\` directive.`
      );
    }
  }

  ngOnInit() {
    if (!this.paramKey) {
      throw new Error(
        `Input of \`paramKey\` is required for Query Param Control Directive on element: ${this.elRef.nativeElement.outerHTML}`
      );
    }

    this.isReactiveControl = !!this.reactiveControl;
    this.isCheckbox = this.elRef.nativeElement.type === 'checkbox';

    const initalQueryParamValue = this.route.snapshot.queryParamMap.get(
      this.paramKey
    );
    if (!!initalQueryParamValue) {
      const value = decodeValueFromUrl(initalQueryParamValue);
      if (this.isReactiveControl) {
        this.reactiveControl.control.setValue(value);
      } else if (this.isCheckbox) {
        this.renderer.setProperty(
          this.elRef.nativeElement,
          'checked',
          value.includes(this.elRef.nativeElement.value)
        );
      } else {
        this.renderer.setProperty(this.elRef.nativeElement, 'value', value);
      }
    } else {
      if (this.isReactiveControl) {
        this.setQueryParam(this.reactiveControl.control.value);
      } else if (this.isCheckbox) {
        const val = this.getCheckBoxesValueForParams();
        // How to sync with other checkboxes? This works if only a single checkbox for a particular param is initially checked, but not more
        if (!!val) {
          this.setQueryParam(val);
        }
      } else {
        this.setQueryParam(this.elRef.nativeElement.value);
      }
    }

    if (this.isReactiveControl) {
      this.destroy = new Subject();
      this.reactiveControl.control.valueChanges
        .pipe(takeUntil(this.destroy))
        .subscribe(value => this.setQueryParam(value));
    }
  }

  ngOnDestroy() {
    if (!!this.destroy) {
      this.destroy.next();
      this.destroy.complete();
    }
  }

  private setQueryParam(rawValue: any) {
    const value = rawValue || undefined;
    this.router.navigate([], {
      queryParams: {
        [this.paramKey]: !!value
          ? encodeURIComponent(
              typeof value === 'object' ? JSON.stringify(value) : value
            )
          : value
      },
      queryParamsHandling: this.mergeParam ? 'merge' : 'preserve'
    });
  }

  private getCheckBoxesValueForParams() {
    const checkboxValue = this.elRef.nativeElement.checked
      ? this.elRef.nativeElement.value
      : undefined;
    const previousCheckBoxesValue: any[] = decodeValueFromUrl(
      this.route.snapshot.queryParamMap.get(this.paramKey)
    );
    let values = [];
    if (!checkboxValue && !!previousCheckBoxesValue) {
      values = previousCheckBoxesValue.filter(
        val => val !== this.elRef.nativeElement.value
      );
    } else if (!!checkboxValue) {
      values = [...(previousCheckBoxesValue || []), checkboxValue];
    }
    return !!values.length ? values : undefined;
  }
}
