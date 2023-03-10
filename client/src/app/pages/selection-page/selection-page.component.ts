import { Component, OnInit } from '@angular/core';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { Constants } from '@common/constants';
import { SocketHandler } from '@app/services/socket-handler.service';

interface SelectionData {
    levelId: number;
    canJoin: boolean;
}

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

    constructor(private communicationService: CommunicationService, private socketHandler: SocketHandler) {}

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
        this.communicationService.getLevels().subscribe((value) => {
            this.levels = value;

            this.lastShownLevel = Constants.levelsPerPage;
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
            this.lastPage = Math.ceil(this.levels.length / Constants.levelsPerPage - 1);
        });

        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
        }

        this.socketHandler.on('game', 'updateSelection', (data) => {
            const selectionData: SelectionData = data as SelectionData;
            this.levels.forEach((level) => {
                if (level.id === selectionData.levelId) {
                    level.canJoin = selectionData.canJoin;
                }
            });
        });
    }
}
