import { Component, OnInit } from '@angular/core';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-video-timer',
    templateUrl: './video-timer.component.html',
    styleUrls: ['./video-timer.component.scss'],
})
export class VideoTimerComponent implements OnInit {
    gameTimeFormatted: string;
    interval: ReturnType<typeof setInterval>;
    time: number = 0;
    /**
     * This method verifies if we aren't connected to the time gateway and connects us to it
     * if that was the case. We then send the corresponding soloClassic event and prepare to
     * listen on any 'timer' event for which we want to update the timer value.
     */
    ngOnInit(): void {
        this.updateTimer(0);
    }

    /**
     * Sets the timer to the given value.
     * Formats the time into a MM:SS format.
     *
     * @param time The time to set the timer to.
     */
    updateTimer(time: number): void {
        const minutes: number = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds: number = time % Constants.SECONDS_PER_MINUTE;
        const minutesString: string = minutes < Constants.PADDING_NUMBER ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.PADDING_NUMBER ? '0' + seconds : seconds.toString();
        this.gameTimeFormatted = 'Temps: ' + minutesString + ':' + secondsString;
    }

    startTimer() {
        this.interval = setInterval(() => {
            this.updateTimer(this.time++);
        }, Constants.millisecondsInOneSecond);
    }

    stopTimer() {
        clearInterval(this.interval);
    }

    resetTimer() {
        this.stopTimer();
        this.time = 0;
        this.updateTimer(this.time);
    }
}
