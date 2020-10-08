import { TestBed } from '@angular/core/testing';

import { ItemSyncService } from './item-sync.service';

describe('ItemSyncService', () => {
  let service: ItemSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
