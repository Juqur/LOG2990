import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

/**
 * Component that displays a preview
 * of a level and its difficulty
 *
 * @author Galen Hu
 * @class CardComponent
 */
@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
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
    @Input() isSelectionPage: boolean = true;
    @Output() startGameDialogEvent = new EventEmitter();

    private imgPath: string = environment.serverUrl + 'original/';

    private saveDialogData: DialogData = {
        textToSend: 'Veuillez entrer votre nom',
        inputData: {
            inputLabel: 'Nom du joueur',
            submitFunction: (value) => {
                return value.length >= 1 && value.length <= Constants.MAX_NAME_LENGTH;
            },
            returnValue: '',
        },
        closeButtonMessage: 'Débuter la partie',
    };

    constructor(private router: Router, public popUpService: PopUpService, private socketHandler: SocketHandler) {}
    get getImg(): string {
        return this.imgPath;
    }

    /**
     * Display the difficulty of the level
     *
     * @returns the path difficulty image
     */
    displayDifficultyIcon(): string {
        return this.level.isEasy ? '../../../assets/images/easy.png' : '../../../assets/images/hard.png';
    }

    /**
     * Opens a pop-up to ask the player to enter his name
     * Then redirects to the game page with the right level id, and puts the player name as a query parameter
     */
    playSolo(): void {
        this.popUpService.openDialog(this.saveDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.socketHandler.send('game', 'onJoinNewGame', { levelId: this.level.id, playerName: result });
                this.router.navigate([`/game/${this.level.id}/`], {
                    queryParams: { playerName: result },
                });
            }
        });
    }

    playMultiplayer(): void {
        this.startGameDialogEvent.emit(this.level.id);
    }
}
