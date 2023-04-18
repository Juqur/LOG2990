import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Dialogs } from '@app/interfaces/dialogs';
import { DialogData, PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { Level } from '@common/interfaces/level';
import { environment } from 'src/environments/environment';

/**
 * Component that displays a preview of a level and its difficulty.
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
    @Input() level: Level = Constants.DEFAULT_LEVEL;
    @Input() isSelectionPage: boolean = true;
    @Output() startGameDialogEvent = new EventEmitter();
    @Output() deleteLevelEvent = new EventEmitter<number>();

    readonly imagePath: string = environment.serverUrl + 'original/';

    private deleteDialogData: DialogData = {
        textToSend: 'Voulez-vous vraiment supprimer ce niveau?',
        isConfirmation: true,
        closeButtonMessage: '',
        mustProcess: true,
    };

    constructor(private router: Router, public popUpService: PopUpService, private socketHandler: SocketHandler) {}

    /**
     * Display the difficulty of the level.
     *
     * @returns The path difficulty image.
     */
    displayDifficultyIcon(): string {
        return this.level.isEasy ? 'assets/images/easy.png' : 'assets/images/hard.png';
    }

    /**
     * Opens a pop-up to ask the player to enter his name then redirects to the
     * game page with the right level id, and puts the player name as a query parameter.
     */
    playSolo(): void {
        this.popUpService.openDialog(Dialogs.inputNameDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.socketHandler.send('game', 'onJoinNewGame', { levelId: this.level.id, playerName: result });
                this.router.navigate([`/game/${this.level.id}/`], {
                    queryParams: { playerName: result },
                });
            }
        });
    }

    /**
     * Sends an event for a multiplayer game.
     */
    playMultiplayer(): void {
        this.startGameDialogEvent.emit(this.level.id);
    }

    /**
     * Handles the click on the delete button.
     * A popup is opened to ask for confirmation.
     */
    deleteLevel(levelId: number): void {
        this.popUpService.openDialog(this.deleteDialogData);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.deleteLevelEvent.emit(levelId);
            }
        });
    }
}
