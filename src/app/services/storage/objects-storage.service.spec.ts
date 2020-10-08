import { TestBed } from '@angular/core/testing';

import { ObjectsStorageService } from './objects-storage.service';

describe('ObjectsStorageService', () => {
  let service: ObjectsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectsStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
