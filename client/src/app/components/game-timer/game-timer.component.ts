import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit {
<<<<<<< HEAD
    constructor() {}

    ngOnInit(): void {}
=======
    @Input() isCountDown: boolean;
    @Input() gameLength: number;

    gameTime: number = 0;
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
        this.gameTime = this.gameLength;
        this.interval = setInterval(() => {
            if (this.gameTime >= 0) {
                this.gameTime--;
            } else {
                // TODO
                // Send message that timer has ended.
            }
            this.formatTime();
        }, this.waitTime);
    }

    upTimer() {
        this.gameTime = 0;
        this.interval = setInterval(() => {
            if (this.gameTime < this.gameLength) {
                this.gameTime++;
            } else {
                // TODO
                // Send message that timer has ended.
            }
            this.formatTime();
        }, this.waitTime);
    }

    formatTime() {
        const minutes: number = Math.floor(this.gameTime / 60);
        const seconds: number = this.gameTime - minutes * 60;
        this.gameTimeFormatted = 'Time: ' + minutes + ':' + seconds;
    }

    ngOnInit(): void {
        this.timer();
    }
>>>>>>> feature/VueDeJeuEnSolo/game-timer
}
