import { Component } from '@angular/core';
import { Level, levels } from '@app/levels';
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
export class SelectionPageComponent {
    page = 'selection';
    levels = [...levels];
    currentPage: number = 0;
    levelsPerPage: number = Constants.levelsPerPage;
    firstShownLevel: number = 0;
    lastShownLevel = this.levelsPerPage;
    lastPage = Math.round(levels.length / this.levelsPerPage - 1);

    levelToShow: Level[] = this.levels.slice(this.firstShownLevel, this.lastShownLevel);

    /**
     * Increments the current page and updates the levels on the screen
     */
    nextPage(): void {
        if (this.currentPage < this.lastPage) this.currentPage++;
        this.updateLevels();
    }

    /**
     * Decrements the current page and updates the levels on the screen
     */
    previousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
        this.updateLevels();
    }

    /**
     * Updates the levels on the screen
     */
    updateLevels() {
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
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
}
