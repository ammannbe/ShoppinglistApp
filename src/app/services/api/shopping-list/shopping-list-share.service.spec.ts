import { TestBed } from '@angular/core/testing';

import { ShoppingListShareService } from './shopping-list-share.service';

describe('ShoppingListShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShoppingListShareService = TestBed.get(ShoppingListShareService);
    expect(service).toBeTruthy();
  });
});
