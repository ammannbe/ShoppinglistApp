import { TestBed } from '@angular/core/testing';

import { ShoppingListSyncService } from './shopping-list-sync.service';

describe('ShoppingListSyncService', () => {
  let service: ShoppingListSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingListSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
