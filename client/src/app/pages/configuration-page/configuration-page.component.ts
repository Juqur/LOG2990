import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dialogs } from '@app/interfaces/dialogs';
import { LevelService } from '@app/services/level/level.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';

/**
 * This component represents the page where the user can modify, delete or create new games. It is accessible from
 * a button inside the main page component and can redirect to the creation page.
 *
 * @author Louis Félix St-Amour, Galen Hu & Simon Gagné
 * @class Configuration Component
 */
@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
export class ConfigurationPageComponent implements OnInit, OnDestroy {
    constructor(public levelService: LevelService, private popUpService: PopUpService, public router: Router) {}

    ngOnInit(): void {
        this.levelService.refreshLevels();
        this.levelService.setupSocket();
    }

    ngOnDestroy(): void {
        this.levelService.destroySocket();
    }

    /**
     * Event listener for the delete button.
     * It will call the deleteLevel function from the levelService.
     *
     * @param levelId the id of the level to delete.
     */
    onDeleteLevel(levelId: number): void {
        this.popUpService.openDialog(Dialogs.confirmDeleteLevel);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.levelService.deleteLevel(levelId);
            }
        });
    }

    /**
     * Event listener for the delete all levels button.
     * It will call the deleteAllLevels function from the levelService.
     */
    onDeleteAllLevels(): void {
        this.popUpService.openDialog(Dialogs.confirmDeleteAllLevels);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.levelService.deleteAllLevels();
            }
        });
    }

    onResetLevelHighScore(levelId: number): void {
        this.popUpService.openDialog(Dialogs.confirmResetLevelHighScore);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.levelService.resetLevelHighScore(levelId);
            }
        });
    }

    onResetGameConstants(): void {
        this.popUpService.openDialog(Dialogs.confirmResetGameConstants);
        this.popUpService.dialogRef.afterClosed().subscribe((confirmation) => {
            if (confirmation) {
                this.levelService.resetGameConstants();
            }
        });
    }
}
