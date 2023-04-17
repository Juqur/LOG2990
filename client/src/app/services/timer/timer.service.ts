import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    timer: number = 0;

    get timerValue(): number {
        return this.timer;
    }

    startTimer(): void {
        setInterval(() => {
            this.timer++;
        }, 1);
    }

    stopTimer(): void {
        clearInterval(this.timer);
    }

    endTimer(): void {
        this.timer = 0;
    }
}
