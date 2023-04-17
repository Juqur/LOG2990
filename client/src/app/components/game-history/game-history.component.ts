import { Component, Input } from '@angular/core';
import { GameHistory } from '@common/game-history';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent {
    @Input() gameHistory: GameHistory;
}
