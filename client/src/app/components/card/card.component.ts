import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
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

    @Output() deleteLevelEvent = new EventEmitter<number>();

    readonly imagePath: string = environment.serverUrl + 'originals/';

    private saveDialogData: DialogData = {
        textToSend: 'Veuillez entrer votre nom',
        inputData: {
            inputLabel: 'Nom du joueur',
            submitFunction: (value) => {
                return value.length >= 1 && value.length <= Constants.MAX_NAME_LENGTH;
            },
        },
        closeButtonMessage: 'Débuter la partie',
    };

    private deleteDialogData: DialogData = {
        textToSend: 'Voulez-vous vraiment supprimer ce niveau?',
        isConfirmation: true,
        closeButtonMessage: '',
    };

    constructor(private router: Router, public popUpService: PopUpService) {}

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
                this.router.navigate([`/game/${this.level.id}/`], {
                    queryParams: { playerName: result },
                });
            }
        });
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
