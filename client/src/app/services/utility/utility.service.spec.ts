import { TestBed } from '@angular/core/testing';

import { UtilityService } from './utility.service';

describe('UtilityService', () => {
    let service: UtilityService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UtilityService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('formatTime', () => {
        it('should format 00:00', () => {
            const time = 0;
            expect(UtilityService.formatTime(time)).toEqual('00:00');
        });

        it('should format 00:10', () => {
            const time = 10;
            expect(UtilityService.formatTime(time)).toEqual('00:10');
        });

        it('should format 01:00', () => {
            const time = 60;
            expect(UtilityService.formatTime(time)).toEqual('01:00');
        });

        it('should format 10:00', () => {
            const time = 600;
            expect(UtilityService.formatTime(time)).toEqual('10:00');
        });
    });
});
