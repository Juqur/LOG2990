import { Component, OnInit } from '@angular/core';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})
/**
 * This component is a wrapper to pose on the pages to format the display of elements in a uniform manner.
 *
 * @author Louis Félix St-Amour & Galen Hu
 * @class ScaleContainerComponent
 */
export class ConfigurationComponent implements OnInit {
    levels: Level[];
    currentPage: number = 0;
    levelsPerPage: number = Constants.levelsPerPage;
    firstShownLevel: number = 0;
    lastShownLevel = this.levelsPerPage;
    lastPage: number;

    levelToShow: Level[];

    constructor(private communicationService: CommunicationService) {}

    /**
     * This function increments the currentPage counter and updates the new levels to
     * show on the current page.
     */
    nextPage(): void {
        if (this.currentPage < this.lastPage) this.currentPage++;
        this.updateLevels();
    }

    /**
     * This function decrements and updates the new levels shown on the current page.
     */
    previousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
        this.updateLevels();
    }

    /**
     * Updates the levels shown on the page.
     */
    updateLevels() {
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    /**
     * @returns a boolean indicating if we are at the beginning of the list
     */
    isBeginningOfList(): boolean {
        return this.currentPage <= 0;
    }

    /**
     * @returns a boolean indicating if we are at the end of the list
     */
    isEndOfList(): boolean {
        return this.currentPage >= this.lastPage;
    }

    ngOnInit(): void {
        this.communicationService.getLevels('/image/AllLevels').subscribe((value) => {
            const data = value;
            this.levels = [];
            for (const level of data) {
                this.levels.push(level);
            }
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
            this.lastPage = Math.round(this.levels.length / this.levelsPerPage - 1);
        });
    }
}
