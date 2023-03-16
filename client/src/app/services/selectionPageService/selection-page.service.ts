import { Injectable, OnDestroy } from '@angular/core';
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
export class SelectionPageService implements OnDestroy {
    waitingForSecondPlayer: boolean = true;
    waitingForAcceptation: boolean = true;

    // eslint-disable-next-line max-params
    constructor(private socketHandler: SocketHandler, private router: Router, private popUpService: PopUpService) {}

    ngOnDestroy(): void {
        this.socketHandler.removeListener('updateSelection');
        this.socketHandler.removeListener('invalidName');
        this.socketHandler.removeListener('toBeAccepted');
        this.socketHandler.removeListener('playerSelection');
        this.socketHandler.removeListener('startClassicMultiplayerGame');
        this.socketHandler.removeListener('rejectedGame');
    }

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
                this.waitingForSecondPlayer = false;
                this.popUpService.dialogRef.close();
                const toBeAcceptedDialogData: DialogData = {
                    textToSend: "Partie trouvée ! En attente de l'approbation de l'autre joueur.",
                    closeButtonMessage: 'Annuler',
                };
                this.popUpService.openDialog(toBeAcceptedDialogData);
                this.popUpService.dialogRef.afterClosed().subscribe(() => {
                    if (this.waitingForAcceptation) {
                        this.socketHandler.send('game', 'onGameRejected', {});
                    }
                });
            });
            this.socketHandler.on('game', 'playerSelection', (name) => {
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
                const startGameData: StartGameData = data as StartGameData;
                this.waitingForAcceptation = false;
                this.popUpService.dialogRef.close();
                this.router.navigate([`/game/${startGameData.levelId}/`], {
                    queryParams: { playerName: startGameData.playerName, opponent: startGameData.secondPlayerName },
                });
            });

            this.socketHandler.on('game', 'rejectedGame', () => {
                console.log('rejected');
                this.waitingForAcceptation = false;
                this.popUpService.dialogRef.close();
            });
        }
    }

    waitForMatch(id: number, result: string): void {
        this.socketHandler.send('game', 'onGameSelection', { levelId: id, playerName: result });
        const loadingDialogData: DialogData = {
            textToSend: "En attente d'un autre joueur",
            closeButtonMessage: 'Annuler',
        };
        this.popUpService.openDialog(loadingDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe(() => {
            if (this.waitingForSecondPlayer) {
                this.socketHandler.send('game', 'onGameCancelledWhileWaitingForSecondPlayer', {});
            }
        });
    }

    startGameDialog(levelId: number): void {
        this.waitingForAcceptation = true;
        this.waitingForSecondPlayer = true;
        const saveDialogData: DialogData = {
            textToSend: 'Veuillez entrer votre nom',
            inputData: {
                inputLabel: 'Nom du joueur',
                submitFunction: (value) => {
                    if (value.length >= 1) {
                        return true;
                    }
                    return false;
                },
                returnValue: '',
            },
            closeButtonMessage: 'Lancer la partie',
        };
        this.popUpService.openDialog(saveDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.waitingForSecondPlayer = true;
                this.waitForMatch(levelId, result);
            }
        });
    }
}
