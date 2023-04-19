import { Component } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameHistory } from '@common/game-history';

/**
 * This page represents the history page where a user is able to look at all game histories saved in the database.
 *
 * @author Charles Degrandpré
 * @class GameHistoriesPageComponent
 */
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

    /**
     * Method called when the button to delete the game history is called.
     */
    onClearHistory(): void {
        this.communicationService.deleteGameHistories().subscribe(() => {
            this.gameHistoriesArray = [];
        });
    }
}
