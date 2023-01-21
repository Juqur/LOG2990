import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit {
    @Input() isCountDown: boolean;
    @Input() gameLength: number;

    startTime: number;
    gameTime: number = 1;
    interval: ReturnType<typeof setTimeout>;
    readonly waitTime: number = 1000; // ms

    gameTimeFormatted: string;

    timer() {
        if (this.isCountDown) {
            this.downTimer();
        } else {
            this.upTimer();
        }
    }

    downTimer() {
        this.interval = setInterval(() => {
            if (this.gameTime > 0) {
                const currentTime: number = new Date().getSeconds();
                this.gameTime = this.gameLength - (currentTime - this.startTime);
            } else {
                // TODO
                // Send message that timer has ended.
            }
        }, this.waitTime);
    }

    upTimer() {
        this.interval = setInterval(() => {
            if (this.gameTime < this.gameLength) {
                const currentTime: number = new Date().getSeconds();
                this.gameTime = currentTime - this.startTime;
            } else {
                // TODO
                // Send message that timer has ended.
            }
        }, this.waitTime);
    }

    // TODO
    // Add a time formatter so time shows in HH:MM:SS format.

    ngOnInit(): void {
        this.startTime = new Date().getSeconds();
        this.timer();
    }
}
