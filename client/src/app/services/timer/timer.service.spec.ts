import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Constants } from '@common/constants';

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

    it('startTimer should increment Timer.time', fakeAsync(() => {
        TimerService.startTimer();
        tick(Constants.TIMER_INTERVAL);
        expect(TimerService.timerValue).toBeGreaterThan(0);
        clearInterval(TimerService['timer']);
    }));
});
