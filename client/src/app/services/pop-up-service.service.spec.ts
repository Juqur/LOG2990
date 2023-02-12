import { TestBed } from '@angular/core/testing';

import { PopUpServiceService } from './pop-up-service.service';

describe('PopUpServiceService', () => {
  let service: PopUpServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopUpServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
