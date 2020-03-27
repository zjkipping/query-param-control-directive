import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { decodeValueFromUrl } from 'projects/query-param-control/src/public-api';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnDestroy {
  destroy = new Subject();

  nameControl = new FormControl('Zachary');

  constructor(route: ActivatedRoute) {
    route.queryParamMap
      .pipe(
        map(queryParams =>
          queryParams.keys.reduce(
            (params, key) => ({
              ...params,
              [key]: decodeValueFromUrl(queryParams.get(key))
            }),
            {}
          )
        )
      )
      .subscribe(paramsValue => console.log(paramsValue));
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
