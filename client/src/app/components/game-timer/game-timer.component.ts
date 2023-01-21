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
    readonly waitTimeMs: number = 1000;

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
        }, this.waitTimeMs);
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
        }, this.waitTimeMs);
    }

    ngOnInit(): void {
        this.startTime = new Date().getSeconds();
        this.timer();
    }
}
