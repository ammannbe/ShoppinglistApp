import { TestBed } from '@angular/core/testing';

import { UtilHelperService } from './util-helper.service';

describe('UtilHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UtilHelperService = TestBed.get(UtilHelperService);
    expect(service).toBeTruthy();
  });
});
