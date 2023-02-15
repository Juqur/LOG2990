import { Component, OnInit } from '@angular/core';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

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

    constructor(private communicationService: CommunicationService) {}

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

    ngOnInit(): void {
        this.communicationService.getLevels('/image/allLevels').subscribe((value) => {
            this.levels = value;

            this.lastShownLevel = Constants.levelsPerPage;
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
            this.lastPage = Math.ceil(this.levels.length / Constants.levelsPerPage - 1);
        });
    }
}
