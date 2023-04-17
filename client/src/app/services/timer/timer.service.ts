import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private static time: number = 0;

    static get timerValue(): number {
        return TimerService.time;
    }

    static startTimer(): void {
        console.log('start timer');
        setInterval(() => {
            TimerService.time++;
        }, Constants.TIMER_INTERVAL);
    }

    static stopTimer(): void {
        console.log('stop timer');
        clearInterval(TimerService.time);
    }

    static endTimer(): void {
        TimerService.time = 0;
    }
}
