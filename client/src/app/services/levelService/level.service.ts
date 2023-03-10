import { Injectable } from '@angular/core';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { Constants } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
/**
 * This service is in charge of keeping track of the levels to display and update them
 * depending on if we change page either forward or backwards.
 *
 * @author Louis Félix St-Amour & Charles Degrandpré
 * @class LevelService
 */
export class LevelService {
    private levels: Level[] = [];
    private currentShownPage: number = 0;
    private shownLevels: Level[];

    constructor(communicationService: CommunicationService) {
        communicationService.getLevels().subscribe((value) => {
            this.levels = value;

            this.shownLevels = this.levels.slice(0, Constants.levelsPerPage);
        });
    }

    /**
     * Getter for the levelToShow attribute.
     */
    get levelsToShow(): Level[] {
        return this.shownLevels;
    }

    /**
     * Getter for the current page number
     */
    get currentPage(): number {
        return this.currentShownPage;
    }

    /**
     * Getter for the last page number
     */
    get lastPage(): number {
        return Math.ceil(this.levels.length / Constants.levelsPerPage - 1);
    }

    /**
     * This function is used to refresh the levelToShow attribute and update them with
     * the next levels that should display on the next page.
     */
    nextPage(): void {
        if (this.currentPage < this.lastPage) this.currentShownPage++;
        this.updatePageLevels();
    }

    /**
     * Decrements the current page and updates the levels on the screen
     */
    previousPage(): void {
        if (this.currentPage > 0) this.currentShownPage--;
        this.updatePageLevels();
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

    /**
     * Updates the levels to show depending on the first shown level attribute.
     */
    private updatePageLevels(): void {
        this.shownLevels = this.levels.slice(
            this.currentPage * Constants.levelsPerPage,
            this.currentPage * Constants.levelsPerPage + Constants.levelsPerPage,
        );
    }
}
