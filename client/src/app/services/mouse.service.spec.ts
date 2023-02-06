import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
        });
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
