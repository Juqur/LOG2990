import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Dialogs } from '@app/interfaces/dialogs';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DialogData, PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';

export interface TimedGameData {
    levelId: number;
    otherPlayerName: string;
}

/**
 * Service that handles the main page.
 *
 * @author Junaid Qureshi
 * @class MainPageService
 */
@Injectable({
    providedIn: 'root',
})
export class MainPageService {
    amountOfLevels: number = 0;
    private multiplayerDialog: DialogData = {
        textToSend: 'Voulez-vous jouer avec un autre joueur?',
        isConfirmation: true,
        closeButtonMessage: '',
        mustProcess: false,
    };
    private waitingForPlayer: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        private popUpService: PopUpService,
        private socketHandler: SocketHandler,
        private router: Router,
        private communicationService: CommunicationService,
    ) {}

    async setAmountOfLevels(): Promise<number> {
        this.amountOfLevels = 0;
        await this.communicationService.getLevels().subscribe((levels) => {
            this.amountOfLevels = levels.length;
        });
        return this.amountOfLevels;
    }
    /**
     * This method redirects the user to a specific route.
     *
     * @param route The route to redirect to.
     */
    navigateTo(route: string): void {
        this.router.navigate([route]);
    }

    /**
     * This method opens a dialog to aks for his name.
     */
    chooseName(): void {
        this.popUpService.openDialog(Dialogs.inputNameDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName) {
                this.chooseGameType(playerName);
            }
        });
    }

    /**
     * This method connects to the socket if it is not already connected.
     */
    connectToSocket(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.on('game', 'deleteLevel', () => {
            this.setAmountOfLevels();
        });
        this.socketHandler.on('game', 'refreshLevels', () => {
            this.setAmountOfLevels();
        });
    }

    /**
     * This method opens a dialog to ask if the player wants to play with another player.
     * If the player wants to play with another player, it will create a timed game with multiplayer set to true.
     * If the player does not want to play with another player, it will create a timed game with multiplayer set to false.
     * It will then redirect the player to the game page.
     *
     * @param playerName The name of the player.
     */
    private chooseGameType(playerName: string): void {
        this.popUpService.openDialog(this.multiplayerDialog);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            this.socketHandler.send('game', 'onCreateTimedGame', { multiplayer: result, playerName });
            if (result) {
                this.waitingForOpponent(playerName);
            } else {
                this.router.navigate([`/game/${0}/`], {
                    queryParams: { playerName, gameMode: 'timed' },
                });
            }
        });
    }

    private waitingForOpponent(playerName: string) {
        const dialogData: DialogData = {
            textToSend: "En attente d'un adversaire",
            isConfirmation: false,
            closeButtonMessage: 'Annuler',
            mustProcess: false,
        };
        this.popUpService.openDialog(dialogData);
        this.popUpService.dialogRef.afterClosed().subscribe(() => {
            if (this.waitingForPlayer) {
                this.socketHandler.send('game', 'onTimedGameCancelled');
            }
            this.waitingForPlayer = true;
        });
        this.socketHandler.on('game', 'startTimedGameMultiplayer', (data: TimedGameData) => {
            this.waitingForPlayer = false;
            this.router.navigate([`/game/${data.levelId}/`], {
                queryParams: { playerName, opponent: data.otherPlayerName, gameMode: 'timed' },
            });
            this.popUpService.dialogRef.close();
        });
    }
}
