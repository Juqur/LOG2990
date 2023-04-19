import { Component, Input } from '@angular/core';
import { Constants } from '@common/constants';
import { GameHistory } from '@common/game-history';

/**
 * This component acts as a container for a singular game-history instance.
 *
 * @author Charles Degrandpré
 * @class GameHistoryComponent
 */
@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent {
    @Input() gameHistory: GameHistory;

    /**
     * This method formats a given number of seconds to a string of the MMmin SSs format.
     *
     * @param time The time in seconds.
     * @returns The time formatted in the MMmin SSs format.
     */
    parseTime(time: number): string {
        const minutes = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds = time % Constants.SECONDS_PER_MINUTE;
        return `${minutes}min ${seconds}s`;
    }

    /**
     * This method takes a given date object and formats it to the 'DD month YYYY à HH:MM' format as a string.
     *
     * @param date The date object to format.
     * @returns The date as a string formatted to the format 'DD month YYYY à HH:MM'.
     */
    parseDate(date: Date): string {
        return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    }
}
