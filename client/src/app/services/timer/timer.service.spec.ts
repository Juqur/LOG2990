import { TestBed } from '@angular/core/testing';
// import { Constants } from '@common/constants';

import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
        TimerService.resetTimer();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('startTimer should increment Timer.time', () => {
        TimerService.startTimer();
        expect(TimerService.timerValue).toBeGreaterThan(0);
    });
});
