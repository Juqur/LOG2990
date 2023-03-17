import { Component, OnDestroy, OnInit } from '@angular/core';
import { Constants } from '@common/constants';
import { SocketHandler } from 'src/app/services/socket-handler.service';

/**
 * This component ie visual representation of the timer on the screen.
 *
 * @author Charles Degrandpré & Junaid Qureshi
 * @class GameTimerComponent
 */
@Component({
    selector: 'app-game-timer',
    templateUrl: './game-timer.component.html',
    styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit, OnDestroy {
    gameTimeFormatted: string;

    constructor(private socketHandler: SocketHandler) {}

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
        });
    }

    /**
     * Removes the listener for the 'sendTime' event.
     */
    ngOnDestroy(): void {
        this.socketHandler.removeListener('game', 'sendTime');
    }
}
