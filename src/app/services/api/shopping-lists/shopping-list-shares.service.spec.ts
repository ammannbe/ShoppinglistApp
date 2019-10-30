import { TestBed } from '@angular/core/testing';

import { ShoppingListSharesService } from './shopping-list-shares.service';

describe('ShoppingListSharesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShoppingListSharesService = TestBed.get(ShoppingListSharesService);
    expect(service).toBeTruthy();
  });
});
