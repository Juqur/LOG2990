import { Component, Input, OnInit } from '@angular/core';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit {
    @Input() isCountDown: boolean;
    @Input() gameLength: number;

    gameTime: number = 0;
    interval: ReturnType<typeof setTimeout>;
    readonly waitTime: number = Constants.millisecondsInOneSecond;

    gameTimeFormatted: string;

    timer() {
        if (this.isCountDown) {
            this.downTimer();
        } else {
            this.upTimer();
        }
    }

    downTimer() {
        this.gameTime = this.gameLength;
        this.formatTime();
        this.interval = setInterval(() => {
            if (this.gameTime > 0) {
                this.gameTime--;
            } else {
                clearInterval(this.interval);
                // TODO
                // Send message that timer has ended.
            }
            this.formatTime();
        }, this.waitTime);
    }

    upTimer() {
        this.gameTime = 0;
        this.formatTime();
        this.interval = setInterval(() => {
            if (this.gameTime < this.gameLength) {
                this.gameTime++;
            } else {
                clearInterval(this.interval);
                // TODO
                // Send message that timer has ended.
            }
            this.formatTime();
        }, this.waitTime);
    }

    formatTime() {
        const minutes: number = Math.floor(this.gameTime / Constants.secondsPerMinute);
        const seconds: number = this.gameTime - minutes * Constants.secondsPerMinute;

        const minutesString: string = minutes < Constants.ten ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.ten ? '0' + seconds : seconds.toString();
        this.gameTimeFormatted = 'Time: ' + minutesString + ':' + secondsString;
    }

    ngOnInit(): void {
        this.timer();
    }
}
