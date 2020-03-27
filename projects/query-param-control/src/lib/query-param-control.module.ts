import { NgModule } from '@angular/core';

import { QueryParamControlDirective } from './query-param-control.directive';

@NgModule({
  declarations: [QueryParamControlDirective],
  exports: [QueryParamControlDirective]
})
export class QueryParamControlModule {}
