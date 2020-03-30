import { NgModule } from '@angular/core';

import {
  CheckboxQueryParamControlDirective,
  QueryParamControlDirective
} from './query-param-control.directive';

@NgModule({
  declarations: [
    QueryParamControlDirective,
    CheckboxQueryParamControlDirective
  ],
  exports: [QueryParamControlDirective, CheckboxQueryParamControlDirective]
})
export class QueryParamControlModule {}
