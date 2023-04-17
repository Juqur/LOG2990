import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';

/**
 * This visual representation of the timer on the screen.
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
    bonusTimeAdded: boolean;

    constructor(private socketHandler: SocketHandler) {}

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
        this.socketHandler.on('game', 'sendExtraTime', (data: number) => {
            this.updateTimer(data);
            this.bonusTimeAdded = true;
            setTimeout(() => {
                this.bonusTimeAdded = false;
            }, Constants.millisecondsInOneSecond);
        });
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
        this.gameTimeFormatted = 'Time: ' + minutesString + ':' + secondsString;
    }

    /**
     * Removes the listener for the 'sendTime' event.
     */
    ngOnDestroy(): void {
        this.socketHandler.removeListener('game', 'sendTime');
        this.socketHandler.removeListener('game', 'sendExtraTime');
    }
}
