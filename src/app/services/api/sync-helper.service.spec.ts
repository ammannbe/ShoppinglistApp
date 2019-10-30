import { TestBed } from '@angular/core/testing';

import { SyncHelperService } from './sync-helper.service';

describe('SyncHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SyncHelperService = TestBed.get(SyncHelperService);
    expect(service).toBeTruthy();
  });
});
