import { TestBed } from '@angular/core/testing';

import { QueryParamControlService } from './query-param-control.service';

describe('QueryParamControlService', () => {
  let service: QueryParamControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParamControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
