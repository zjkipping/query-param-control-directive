import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { decodeValueFromUrl } from 'projects/query-param-control/src/public-api';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnDestroy {
  destroy = new Subject();

  foodsControl = new FormControl('burrito');
  foods = [
    { value: 'burrito', display: 'Burrito' },
    { value: 'spaghetti', display: 'Spaghetti' },
    { value: 'chicken_teriyaki', display: 'Chicken Teriyaki' }
  ];

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
