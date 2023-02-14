import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Level } from '@app/levels';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})

/**
 * Component that displays a preview
 * of a level and its difficulty
 *
 * @author Galen HU
 * @class CardComponent
 */
export class CardComponent implements OnInit {
    @Input() level: Level = {
        id: 0,
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        isEasy: true,
    };

    @Input() page: string = 'no page';

    playerName: string = 'player 1';
    difficulty: string;

    constructor(private router: Router, public popUpService: PopUpServiceService) {}

    /**
     * Display the difficulty of the level
     *
     * @returns the difficulty of the level
     */
    displayDifficulty(): string {
        if (this.level.isEasy === true) {
            return 'Easy';
        } else {
            return 'Hard';
        }
    }

    displayDifficultyIcon(isEasy: boolean): string {
        if (isEasy === true) {
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
                    //  Vérifier que le nom du jeu n'existe pas déjà
                    //  Pour l'instant, je limite la longueur du nom à 10 caractères à la place
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
                this.router.navigate([`/game/${this.level.id}/`], {
                    queryParams: { playerName: this.playerName },
                });
            }
        });
    }

    ngOnInit(): void {
        this.difficulty = this.displayDifficulty();
    }
}
