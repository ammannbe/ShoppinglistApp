import { TestBed } from '@angular/core/testing';

import { UnitSyncService } from './unit-sync.service';

describe('UnitSyncService', () => {
  let service: UnitSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
