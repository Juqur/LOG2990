import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
    let service: MouseService;
    // const mockGameId = '10000';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, AppMaterialModule, RouterTestingModule],
        });
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeClickState should change the click state', () => {
        const expectedStartValue = true;
        const expectedEndValue = false;
        expect(service['canClick']).toEqual(expectedStartValue);
        service.changeClickState();
        expect(service['canClick']).toEqual(expectedEndValue);
    });
});
