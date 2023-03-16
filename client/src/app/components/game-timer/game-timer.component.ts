import { Component, OnInit } from '@angular/core';
import { Constants } from '@common/constants';
import { SocketHandler } from 'src/app/services/socket-handler.service';

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
    gameTimeFormatted: string;

    constructor(private socketHandler: SocketHandler) {}

    /**
     * Sets the timer to the given value.
     * Formats the time into a MM:SS format.
     *
     * @param time The time to set the timer to.
     */
    updateTimer(time: number) {
        const minutes: number = Math.floor(time / Constants.secondsPerMinute);
        const seconds: number = time - minutes * Constants.secondsPerMinute;

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
        this.updateTimer(0);
        this.socketHandler.on('game', 'sendTime', (data: number) => {
            this.updateTimer(data);
            console.log(data);
        });
    }
}
