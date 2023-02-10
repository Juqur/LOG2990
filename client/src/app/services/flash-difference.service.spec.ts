import { TestBed } from '@angular/core/testing';

import { FlashDifferenceService } from './flash-difference.service';

describe('FlashDifferenceService', () => {
  let service: FlashDifferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlashDifferenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
