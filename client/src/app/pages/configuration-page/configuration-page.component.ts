import { Component, OnInit } from '@angular/core';
import { LevelService } from '@app/services/level/level.service';

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
export class ConfigurationPageComponent implements OnInit {
    constructor(public levelService: LevelService) {}

    ngOnInit(): void {
        this.levelService.refreshLevels();
    }

    /**
     * Event listener for the delete button.
     * It will call the deleteLevel function from the levelService.
     *
     * @param levelId the id of the level to delete.
     */
    onDeleteLevel(levelId: number): void {
        this.levelService.deleteLevel(levelId);
    }
}
