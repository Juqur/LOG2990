import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LevelService } from '@app/services/levelService/level.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';

export interface SelectionData {
    levelId: number;
    canJoin: boolean;
}

export interface StartGameData {
    levelId: number;
    playerName: string;
    secondPlayerName: string;
}

/**
 * This service is used to handle the selection page.
 * It handles the socket events and the popups.
 *
 * @author Junaid Qureshi
 * @class SelectionPageService
 */
@Injectable({
    providedIn: 'root',
})
export class SelectionPageService implements OnDestroy {
    waitingForSecondPlayer: boolean = true;
    waitingForAcceptation: boolean = true;
    private dialog: DialogData;

    // eslint-disable-next-line max-params
    constructor(private socketHandler: SocketHandler, private router: Router, private popUpService: PopUpService) {}

    /**
     * This method is called when the page is destroyed.
     * It removes all the socket listeners.
     */
    ngOnDestroy(): void {
        this.socketHandler.removeListener('game', 'updateSelection');
        this.socketHandler.removeListener('game', 'invalidName');
        this.socketHandler.removeListener('game', 'toBeAccepted');
        this.socketHandler.removeListener('game', 'playerSelection');
        this.socketHandler.removeListener('game', 'startClassicMultiplayerGame');
        this.socketHandler.removeListener('game', 'rejectedGame');
        this.socketHandler.removeListener('game', 'shutDownGame');
        this.socketHandler.removeListener('game', 'deleteLevel');
    }

    /**
     * This method is used to setup all the socket listeners.
     * It handles all the popups that are displayed when a player creates/joins a game.
     *
     * @param levelService The level service used to update the level cards.
     */
    setupSocket(levelService: LevelService): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.on('game', 'updateSelection', (data) => {
            this.updateSelection(data as SelectionData, levelService);
        });
        this.socketHandler.on('game', 'invalidName', () => {
            this.openInvalidNameDialog();
        });
        this.socketHandler.on('game', 'toBeAccepted', () => {
            this.openToBeAcceptedDialog();
        });
        this.socketHandler.on('game', 'playerSelection', (name) => {
            this.openPlayerSelectionDialog(name as string);
        });
        this.socketHandler.on('game', 'startClassicMultiplayerGame', (data) => {
            this.startMultiplayerGame(data as StartGameData);
        });
        this.socketHandler.on('game', 'shutDownGame', () => {
            this.closeDialogOnDeletedLevel();
        });
        this.socketHandler.on('game', 'deleteLevel', (gameId) => {
            levelService.removeCard(gameId as number);
        });
        this.socketHandler.on('game', 'rejectedGame', () => {
            this.waitingForAcceptation = false;
            this.popUpService.dialogRef.close();
        });
    }

    /**
     * This method is called when a player creates a game.
     * It asks the player for his name.
     *
     * @param levelId The id of the level that the player wants to play.
     */
    startGameDialog(levelId: number): void {
        this.waitingForAcceptation = true;
        this.waitingForSecondPlayer = true;
        this.dialog = {
            textToSend: 'Veuillez entrer votre nom',
            inputData: {
                inputLabel: 'Nom du joueur',
                submitFunction: (value) => {
                    if (value.length >= 1) {
                        return true;
                    }
                    return false;
                },
            },
            closeButtonMessage: 'Lancer la partie',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result && this.waitingForSecondPlayer) {
                this.waitForMatch(levelId, result);
            }
        });
    }

    /**
     * This method is called when a player creates a game.
     * It tells the player to wait for the other player to join the game.
     *
     * @param id The id of the level that the player wants to play.
     * @param name The name of the player.
     */
    private waitForMatch(id: number, name: string): void {
        this.socketHandler.send('game', 'onGameSelection', { levelId: id, playerName: name });
        this.dialog = {
            textToSend: "En attente d'un autre joueur",
            closeButtonMessage: 'Annuler',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
        this.popUpService.dialogRef.afterClosed().subscribe(() => {
            if (this.waitingForSecondPlayer) {
                this.socketHandler.send('game', 'onGameCancelledWhileWaitingForSecondPlayer', {});
            }
        });
    }

    /**
     * This methods is called when a game is created in the server.
     * It updates the cards component to show the game as joinable.
     *
     * @param data The data received from the server used to update the level cards.
     * @param levelService The level service used to update the level cards.
     */
    private updateSelection(data: SelectionData, levelService: LevelService): void {
        levelService.allLevels.forEach((level) => {
            if (level.id === data.levelId) {
                level.canJoin = data.canJoin;
            }
        });
    }

    /**
     * This method is called if the player name is invalid.
     */
    private openInvalidNameDialog(): void {
        this.popUpService.dialogRef.close();
        this.dialog = {
            textToSend: 'Le nom choisi est trop court, veuillez en choisir un autre',
            closeButtonMessage: 'OK',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
    }

    /**
     * This method is called when a match has been found and the user is waiting to be accepted.
     * It opens a dialog to inform the user that he is waiting for the other player to accept.
     */
    private openToBeAcceptedDialog(): void {
        this.waitingForSecondPlayer = false;
        this.popUpService.dialogRef.close();
        this.dialog = {
            textToSend: "Partie trouvée ! En attente de l'approbation de l'autre joueur.",
            closeButtonMessage: 'Annuler',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
        this.popUpService.dialogRef.afterClosed().subscribe(() => {
            if (this.waitingForAcceptation) {
                this.socketHandler.send('game', 'onGameRejected', {});
            }
        });
    }

    /**
     * This method is called when a player wants to join a game.
     * It opens a dialog to ask the user if he wants to accept the player.
     *
     * @param name The name of the player that wants to join the game
     */
    private openPlayerSelectionDialog(name: string): void {
        this.waitingForSecondPlayer = false;
        this.popUpService.dialogRef.close();
        this.dialog = {
            textToSend: 'Voulez-vous autoriser ' + name + ' à participer à votre jeu ?',
            closeButtonMessage: 'Annuler',
            isConfirmation: true,
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.socketHandler.send('game', 'onGameAccepted', {});
            } else if (this.waitingForAcceptation) {
                this.socketHandler.send('game', 'onGameRejected', {});
            }
        });
    }

    /**
     * This method is called when a game is started in the server.
     * It redirects the user to the game page.
     *
     * @param data The data received from the server used to start the game.
     */
    private startMultiplayerGame(data: StartGameData): void {
        this.waitingForAcceptation = false;
        this.popUpService.dialogRef.close();
        this.router.navigate([`/game/${data.levelId}/`], {
            queryParams: { playerName: data.playerName, opponent: data.secondPlayerName },
        });
    }

    /**
     * This method is called when a level gets deleted while a player is waiting for a match.
     */
    private closeDialogOnDeletedLevel(): void {
        this.waitingForAcceptation = false;
        this.waitingForSecondPlayer = false;
        this.popUpService.dialogRef.close();
        this.dialog = {
            textToSend: "Le niveau n'existe plus, veuillez en choisir un autre",
            closeButtonMessage: 'OK',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.dialog);
    }
}
