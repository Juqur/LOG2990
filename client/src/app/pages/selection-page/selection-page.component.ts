import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';

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
    page = 'selection';
    levels: Level[] = [];
    currentPage: number = 0;
    firstShownLevel: number = 0;
    lastShownLevel: number = 0;
    lastPage: number = 0;
    levelToShow: Level[];
    waitingForSecondPlayer: boolean = true;
    waitingForAcceptation: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        private communicationService: CommunicationService,
        private socketHandler: SocketHandler,
        private router: Router,
        private popUpService: PopUpService,
    ) {}

    nextPage(): void {
        if (this.currentPage < this.lastPage) this.currentPage++;
        this.firstShownLevel = this.currentPage * Constants.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + Constants.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    /**
     * Decrements the current page and updates the levels on the screen
     */
    previousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
        this.firstShownLevel = this.currentPage * Constants.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + Constants.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    /**
     * Checks if we have reached the last page
     *
     * @returns a boolean indicating if we are on the last page
     */
    isBeginningOfList(): boolean {
        return this.currentPage <= 0;
    }

    /**
     * Checks if we have reached the first page
     *
     * @returns a boolean indicating if we are on the first page
     */
    isEndOfList(): boolean {
        return this.currentPage >= this.lastPage;
    }

    resetDialog(): void {
        this.waitingForSecondPlayer = true;
        this.waitingForAcceptation = true;
    }

    ngOnInit(): void {
        this.communicationService.getLevels().subscribe((value) => {
            this.levels = value;

            this.lastShownLevel = Constants.levelsPerPage;
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
            this.lastPage = Math.ceil(this.levels.length / Constants.levelsPerPage - 1);
        });

        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
            this.socketHandler.on('game', 'updateSelection', (data) => {
                const selectionData: SelectionData = data as SelectionData;
                this.levels.forEach((level) => {
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
