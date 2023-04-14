import { Injectable } from '@angular/core';
import { Level } from '@app/interfaces/levels';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';

/**
 * This service is in charge of keeping track of the levels to display and update them
 * depending on if we change page either forward or backwards.
 *
 * @author Louis Félix St-Amour & Charles Degrandpré
 * @class LevelService
 */
@Injectable({
    providedIn: 'root',
})
export class LevelService {
    private levels: Level[] = [];
    private currentShownPage: number = 0;
    private shownLevels: Level[];

    constructor(communicationService: CommunicationService, private socketHandler: SocketHandler) {
        communicationService.getLevels().subscribe((value) => {
            this.levels = value;
            this.shownLevels = this.levels.slice(0, Constants.levelsPerPage);
        });
    }

    /**
     * Getter for the levels attribute.
     */
    get allLevels(): Level[] {
        return this.levels;
    }

    /**
     * Getter for the levelToShow attribute.
     */
    get levelsToShow(): Level[] {
        return this.shownLevels;
    }

    /**
     * Getter for the current page number.
     */
    get currentPage(): number {
        return this.currentShownPage;
    }

    /**
     * Getter for the last page number.
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
     * Decrements the current page and updates the levels on the screen.
     */
    previousPage(): void {
        if (this.currentPage > 0) this.currentShownPage--;
        this.updatePageLevels();
    }

    /**
     * Checks if we have reached the first page.
     *
     * @returns A boolean indicating it is on first page.
     */
    isBeginningOfList(): boolean {
        return this.currentPage <= 0;
    }

    /**
     * Checks if we have reached the last page.
     *
     * @returns A boolean indicating it is on last page.
     */
    isEndOfList(): boolean {
        return this.currentPage >= this.lastPage;
    }

    /**
     * This method emits a socket event to the server to delete a level.
     *
     * @param levelId The id of the level to delete.
     */
    deleteLevel(levelId: number): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.send('game', 'onDeleteLevel', levelId);
        this.removeCard(levelId);
    }

    /**
     * This method removes a level from the levels array.
     *
     * @param levelId The id of the level to remove.
     */
    removeCard(levelId: number): void {
        this.levels = this.levels.filter((level) => level.id !== levelId);
        this.updatePageLevels();
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
