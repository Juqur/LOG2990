import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private static time: number = Constants.TIMER_START;
    private static timer: ReturnType<typeof setInterval>;

    static get timerValue(): number {
        return TimerService.time;
    }

    static startTimer(): void {
        console.log('start timer');
        TimerService.timer = setInterval(() => {
            TimerService.time++;
        }, Constants.TIMER_INTERVAL);
    }

    static stopTimer(): void {
        console.log('stop timer');
        clearInterval(TimerService.timer);
    }

    static resetTimer(): void {
        TimerService.time = Constants.TIMER_START;
    }
}
