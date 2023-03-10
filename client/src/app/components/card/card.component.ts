import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})

/**
 * Component that displays a preview
 * of a level and its difficulty
 *
 * @author Galen Hu
 * @class CardComponent
 */
export class CardComponent {
    @Input() level: Level = {
        id: 0,
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        isEasy: true,
        nbDifferences: 7,
    };
    @Input() page: string = 'no page';
    @Input() waitingForSecondPlayer: boolean = true;
    @Output() resetDialogEvent = new EventEmitter();

    imgPath: string = environment.serverUrl + 'originals/';

    playerName: string = 'player 1';
    difficulty: string;

    constructor(private router: Router, public popUpService: PopUpService, private socketHandler: SocketHandler) {}

    /**
     * Display the difficulty of the level
     *
     * @returns the path difficulty image
     */
    displayDifficultyIcon(): string {
        if (this.level.isEasy) {
            return '../../../assets/images/easy.png';
        } else {
            return '../../../assets/images/hard.png';
        }
    }

    /**
     * Opens a pop-up to ask the player to enter his name
     * Then redirects to the game page with the right level id, and puts the player name as a query parameter
     *
     *
     */
    playSolo(): void {
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
            closeButtonMessage: 'Débuter la partie',
        };
        this.popUpService.openDialog(saveDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.playerName = result;
                this.socketHandler.send('game', 'onJoinNewGame', { levelId: this.level.id, playerName: result });
                this.router.navigate([`/game/${this.level.id}/`], {
                    queryParams: { playerName: this.playerName },
                });
            }
        });
    }

    waitForMatch(result: string): void {
        this.socketHandler.send('game', 'onGameSelection', { levelId: this.level.id, playerName: result });
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

    playMultiplayer(): void {
        this.resetDialogEvent.emit();
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
                this.playerName = result;
                this.waitForMatch(result);
            }
        });
    }
}
