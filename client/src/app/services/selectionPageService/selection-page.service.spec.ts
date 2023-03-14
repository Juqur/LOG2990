import { TestBed } from '@angular/core/testing';

import { SelectionPageService } from './selection-page.service';

describe('SelectionPageService', () => {
  let service: SelectionPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
