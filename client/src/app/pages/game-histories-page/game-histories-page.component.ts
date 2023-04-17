import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameHistory } from '@common/game-history';

@Component({
    selector: 'app-game-histories-page',
    templateUrl: './game-histories-page.component.html',
    styleUrls: ['./game-histories-page.component.scss'],
})
export class GameHistoriesPageComponent {
    private gameHistoriesArray: GameHistory[];
    constructor(private communicationService: CommunicationService) {
        this.communicationService.getGameHistories().subscribe((value) => {
            this.gameHistoriesArray = value;
        });
    }

    /**
     * Getter for the games histories.
     */
    get gameHistories(): GameHistory[] {
        return this.gameHistoriesArray;
    }
}
