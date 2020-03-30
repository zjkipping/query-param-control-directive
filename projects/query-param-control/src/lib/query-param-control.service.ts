import { Injectable, Optional, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { tap, debounceTime, map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QueryParamControlService implements OnDestroy {
  private noRoutingSetup: boolean;
  private batchedQueryParamNavigations = new Subject<NavigationExtras>();
  private destroy = new Subject();

  constructor(
    @Optional() private readonly router?: Router,
    @Optional() private readonly route?: ActivatedRoute
  ) {
    this.noRoutingSetup = !this.router || !this.route;
    if (this.noRoutingSetup) {
      throw new Error(
        `No routing setup could be found for the application.
         You will need to setup & define the RouterModule in your application to make use of the \`queryParamControl\` directive.`
      );
    } else {
      // The Router will cancel navigations if their are multiple within a small timeframe (initialization/destruction).
      // This stream will accumulate the NavigationExtras over a 50MS period and then navigate once to avoid spamming the route.navigate.
      this.batchedQueryParamNavigations
        .pipe(
          accumulativeDebounceTime(50),
          map(values =>
            [
              {
                queryParams: this.route.snapshot.queryParams,
                queryParamsHandling: 'merge'
              },
              ...values
            ].reduce((resultExtras, current) => {
              if (current.queryParamsHandling === 'merge') {
                return { ...resultExtras, ...current.queryParams };
              } else {
                return current.queryParams;
              }
            }, {})
          ),
          takeUntil(this.destroy)
        )
        .subscribe(queryParams =>
          this.router.navigate([], {
            queryParams,
            queryParamsHandling: 'merge'
          })
        );
    }
  }

  getInitalParamValue(paramKey: string) {
    return this.route?.snapshot.queryParamMap.get(paramKey);
  }

  setQueryParam(
    rawValue: any,
    paramKey: string,
    queryParamsHandling: 'merge' | 'preserve'
  ) {
    const value = rawValue || undefined;
    const queryParams = {
      [paramKey]: !!value
        ? encodeURIComponent(
            typeof value === 'object' ? JSON.stringify(value) : value
          )
        : value
    };
    this.batchedQueryParamNavigations.next({
      queryParams,
      queryParamsHandling
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}

function accumulativeDebounceTime(dueTime: number) {
  return <T>(source: Observable<T>): Observable<T[]> => {
    let accumulatedValues = [];
    return source.pipe(
      tap(value => accumulatedValues.push(value)),
      debounceTime(dueTime),
      map(() => accumulatedValues),
      tap(() => (accumulatedValues = []))
    );
  };
}
