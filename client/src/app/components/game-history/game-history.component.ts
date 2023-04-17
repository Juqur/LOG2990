import { Component, Input } from '@angular/core';
import { Constants } from '@common/constants';
import { GameHistory } from '@common/game-history';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent {
    @Input() gameHistory: GameHistory;

    parseTime(time: number): string {
        const minutes = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds = time % Constants.SECONDS_PER_MINUTE;
        return `${minutes}min ${seconds}s`;
    }

    parseDate(date: Date): string {
        return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    }
}
