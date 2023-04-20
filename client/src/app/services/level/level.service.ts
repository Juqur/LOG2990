import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { GameConstants } from '@common/game-constants';
import { Level } from '@common/interfaces/level';
import { tap } from 'rxjs';

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
    private gameConstants: GameConstants | null = null;
    private levels: Level[] = [];
    private currentShownPage: number = 0;
    private shownLevels: Level[];

    constructor(private communicationService: CommunicationService, private socketHandler: SocketHandler) {
        this.refreshLevels();
        this.communicationService
            .getGameConstants()
            .pipe(
                tap((value) => {
                    this.gameConstants = value;
                }),
            )
            .subscribe();
    }

    /**
     * Getter for the initial time.
     */
    get initialTime(): number {
        return this.gameConstants ? this.gameConstants.initialTime : Constants.INIT_COUNTDOWN_TIME;
    }

    /**
     * Getter for the time penalty on using hints value.
     */
    get timePenaltyHint(): number {
        return this.gameConstants ? this.gameConstants.timePenaltyHint : Constants.HINT_PENALTY;
    }

    /**
     * Getter for the time gained on finding a difference value.
     */
    get timeGainedDifference(): number {
        return this.gameConstants ? this.gameConstants.timeGainedDifference : Constants.COUNTDOWN_TIME_WIN;
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
     * This method refreshes the levels when a event is emitted from the server.
     */
    setupSocket(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
        this.socketHandler.on('game', 'refreshLevels', () => {
            this.refreshLevels();
        });
    }

    /**
     * This method removes the listener for the refreshLevels event.
     */
    destroySocket(): void {
        this.socketHandler.removeListener('game', 'refreshLevels');
    }

    /**
     * Sets new game constants for all games.
     *
     * @param event The event that triggered the function.
     */
    setNewGameConstants(event: Event): void {
        if (this.gameConstants) {
            const input = event.target as HTMLInputElement;
            let valueChanged = false;
            const inputValue = Number(input.value);
            switch (input.id) {
                case 'initial-time-input': {
                    if (inputValue !== this.gameConstants.initialTime && inputValue <= Constants.MAX_GAME_TIME_LENGTH && inputValue > 0) {
                        this.gameConstants.initialTime = inputValue;
                        valueChanged = true;
                    }
                    break;
                }
                case 'time-penalty-hint-input': {
                    if (inputValue !== this.gameConstants.timePenaltyHint && inputValue >= 0 && inputValue <= Constants.MAX_TIME_PENALTY_HINT) {
                        this.gameConstants.timePenaltyHint = inputValue;
                        valueChanged = true;
                    }
                    break;
                }
                case 'time-gained-difference-input': {
                    if (
                        inputValue !== this.gameConstants.timeGainedDifference &&
                        inputValue >= 0 &&
                        inputValue <= Constants.MAX_TIME_GAINED_DIFFERENCE
                    ) {
                        this.gameConstants.timeGainedDifference = inputValue;
                        valueChanged = true;
                    }
                    break;
                }
            }
            if (valueChanged) {
                this.communicationService.setNewGameConstants(this.gameConstants).subscribe();
                alert('La valeur a été modifiée avec succès.');
            }
        }
    }

    /**
     * Resets the game constants to their default values.
     */
    resetGameConstants(): void {
        this.gameConstants = {
            initialTime: Constants.INIT_COUNTDOWN_TIME,
            timePenaltyHint: Constants.HINT_PENALTY,
            timeGainedDifference: Constants.COUNTDOWN_TIME_WIN,
        };
        this.communicationService.resetGameConstants().subscribe();
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
     * This function is used to refreshes and retrieves levels from the server.
     */
    refreshLevels(): void {
        this.communicationService.getLevels().subscribe((value) => {
            this.levels = value;
            this.shownLevels = this.levels.slice(0, Constants.levelsPerPage);
        });
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
        this.checkForSocketConnection();
        this.socketHandler.send('game', 'onDeleteLevel', levelId);
        this.removeCard(levelId);
    }

    /**
     * This method emits a socket event to the server to delete all levels.
     */
    deleteAllLevels(): void {
        if (this.levels.length < 1) {
            return;
        }
        this.checkForSocketConnection();
        this.socketHandler.send('game', 'onDeleteAllLevels');
        this.removeAllCards();
    }

    /**
     * This method emits a socket event to the server to reset the level's high score.
     *
     * @param levelId The id of the level's high score to reset.
     */
    resetLevelHighScore(levelId: number): void {
        this.checkForSocketConnection();
        this.socketHandler.send('game', 'onResetLevelHighScore', levelId);
        this.resetCard(levelId);
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
     * This method removes all levels from the levels array.
     */
    removeAllCards(): void {
        this.levels = [];
        this.updatePageLevels();
    }

    /**
     * This method resets the high score of a level.
     */
    resetCard(levelId: number): void {
        this.levels.forEach((level) => {
            if (level.id === levelId) {
                level.playerSolo = Constants.defaultPlayerSolo;
                level.timeSolo = Constants.defaultTimeSolo;
                level.playerMulti = Constants.defaultPlayerMulti;
                level.timeMulti = Constants.defaultTimeMulti;
            }
        });
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

    /**
     * Internal method that ensures the socket is connected.
     */
    private checkForSocketConnection(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }
    }
}
