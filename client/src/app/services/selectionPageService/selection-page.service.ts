import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LevelService } from '@app/services/levelService/level.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';

interface SelectionData {
    levelId: number;
    canJoin: boolean;
}

interface StartGameData {
    levelId: number;
    playerName: string;
    secondPlayerName: string;
}

@Injectable({
    providedIn: 'root',
})
export class SelectionPageService {
    waitingForSecondPlayer: boolean = true;
    waitingForAcceptation: boolean = true;

    // eslint-disable-next-line max-params
    constructor(private socketHandler: SocketHandler, private router: Router, private popUpService: PopUpService) {}

    setupSocket(levelService: LevelService): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
            this.socketHandler.on('game', 'updateSelection', (data) => {
                const selectionData: SelectionData = data as SelectionData;
                levelService.levelsToShow.forEach((level) => {
                    if (level.id === selectionData.levelId) {
                        level.canJoin = selectionData.canJoin;
                    }
                });
            });
            this.socketHandler.on('game', 'invalidName', () => {
                this.popUpService.dialogRef.close();
                const invalidNameDialogData: DialogData = {
                    textToSend: 'Le nom choisi est trop court, veuillez en choisir un autre',
                    closeButtonMessage: 'OK',
                };
                this.popUpService.openDialog(invalidNameDialogData);
            });
            this.socketHandler.on('game', 'toBeAccepted', () => {
                console.log('toBeAccepted');
                this.waitingForSecondPlayer = false;
                console.log(this.waitingForSecondPlayer);
                this.popUpService.dialogRef.close();
                console.log('dialog closed');
                const toBeAcceptedDialogData: DialogData = {
                    textToSend: "Partie trouvée ! En attente de l'approbation de l'autre joueur.",
                    closeButtonMessage: 'Annuler',
                };
                this.popUpService.openDialog(toBeAcceptedDialogData);
                this.popUpService.dialogRef.afterClosed().subscribe(() => {
                    if (this.waitingForAcceptation) {
                        this.socketHandler.send('game', 'onGameCancelledWhileWaitingForAcceptation', {});
                    }
                });
            });
            this.socketHandler.on('game', 'playerSelection', (name) => {
                console.log('playerSelection');
                this.waitingForSecondPlayer = false;
                this.popUpService.dialogRef.close();
                const toBeAcceptedDialogData: DialogData = {
                    textToSend: 'Voulez-vous autoriser ' + name + ' à participer à votre jeu ?',
                    closeButtonMessage: 'Annuler',
                    isConfirmation: true,
                };
                this.popUpService.openDialog(toBeAcceptedDialogData);
                this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
                    if (confirmation) {
                        this.socketHandler.send('game', 'onGameAccepted', {});
                    } else if (this.waitingForAcceptation) {
                        this.socketHandler.send('game', 'onGameRejected', {});
                    }
                });
            });
            this.socketHandler.on('game', 'startClassicMultiplayerGame', (data) => {
                console.log(this.waitingForSecondPlayer);
                console.log('startClassicMultiplayerGame');
                const startGameData: StartGameData = data as StartGameData;
                this.waitingForAcceptation = false;
                this.popUpService.dialogRef.close();
                this.router.navigate([`/game/${startGameData.levelId}/`], {
                    queryParams: { playerName: startGameData.playerName, opponent: startGameData.secondPlayerName },
                });
            });

            this.socketHandler.on('game', 'rejectedGame', () => {
                console.log('rejectedGame');
                this.waitingForAcceptation = false;
                this.popUpService.dialogRef.close();
            });
        }
    }

    resetDialog(): void {
        console.log('resetDialog');
        this.waitingForAcceptation = true;
        this.waitingForSecondPlayer = true;
    }
}
