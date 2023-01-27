import { TestBed } from '@angular/core/testing';

import { DifferenceDetectorService } from './difference-detector.service';

describe('DifferenceDetectorService', () => {
    let service: DifferenceDetectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceDetectorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
