import { Component, OnInit } from '@angular/core';
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

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
/**
 * This component represents the selection page, it is the page where the user selects which game to play
 * and in what game mode.
 *
 * @author Louis Félix St-Amour
 * @class SelectionPageComponent
 */
export class SelectionPageComponent implements OnInit {
    waitingForSecondPlayer: boolean = true;
    waitingForAcceptation: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        private socketHandler: SocketHandler,
        private router: Router,
        private popUpService: PopUpService,
        public levelService: LevelService,
    ) {}

    resetDialog(): void {
        this.waitingForSecondPlayer = true;
        this.waitingForAcceptation = true;
    }

    ngOnInit(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
            this.socketHandler.on('game', 'updateSelection', (data) => {
                const selectionData: SelectionData = data as SelectionData;
                this.levelService.levelsToShow.forEach((level) => {
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
                        this.socketHandler.send('game', 'onGameCancelledWhileWaitingForAcceptation', {});
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
                this.waitingForSecondPlayer = false;
                this.popUpService.dialogRef.close();
                this.router.navigate([`/game/${startGameData.levelId}/`], {
                    queryParams: { playerName: startGameData.playerName, opponent: startGameData.secondPlayerName },
                });
            });

            this.socketHandler.on('game', 'rejectedGame', () => {
                this.waitingForAcceptation = false;
                this.waitingForSecondPlayer = false;
                this.popUpService.dialogRef.close();
            });
        }
    }
}
