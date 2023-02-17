import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Constants } from '@common/constants';
import { Gateways, SocketHandler } from 'src/app/services/socket-handler.service';

@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})

/**
 * Is the visual representation of the timer on the screen.
 *
 * @author Charles Degrandpré & Junaid Qureshi
 * @class GameTimerComponent
 */
export class GameTimerComponent implements OnInit {
    gameTime: number = 0;
    gameTimeFormatted: string;

    constructor(private socketHandler: SocketHandler, private router: Router) {}

    /**
     * Sets the game time variable to the new time value and calls formatTime.
     *
     * @param value the new value of the timer in seconds.
     */
    setTimer(value: number) {
        this.gameTime = value;
        this.formatTime();
    }

    /**
     * Formats the time into a MM:SS format.
     */
    formatTime() {
        const minutes: number = Math.floor(this.gameTime / Constants.secondsPerMinute);
        const seconds: number = this.gameTime - minutes * Constants.secondsPerMinute;

        const minutesString: string = minutes < Constants.ten ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.ten ? '0' + seconds : seconds.toString();
        this.gameTimeFormatted = 'Time: ' + minutesString + ':' + secondsString;
    }

    /**
     * This method verifies if we aren't connected to the time gateway and connects us to it
     * if that was the case. We then send the corresponding soloClassic event and prepare to
     * listen on any 'timer' event for which we want to update the timer value.
     */
    ngOnInit(): void {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.socketHandler.disconnect(Gateways.Timer);
            }
        });
        this.setTimer(0);
        if (!this.socketHandler.isSocketAlive(Gateways.Timer)) {
            this.socketHandler.connect(Gateways.Timer);
            this.socketHandler.send(Gateways.Timer, 'soloClassic');
            this.socketHandler.on(Gateways.Timer, 'timer', (data: unknown) => {
                this.setTimer(data as number);
            });
        }
    }
}
