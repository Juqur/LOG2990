import { TestBed } from '@angular/core/testing';

import { CreationPageService } from './creation-page.service';

describe('CreationPageService', () => {
    let service: CreationPageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CreationPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
