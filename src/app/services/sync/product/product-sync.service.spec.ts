import { TestBed } from '@angular/core/testing';

import { ProductSyncService } from './product-sync.service';

describe('ProductSyncService', () => {
  let service: ProductSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
