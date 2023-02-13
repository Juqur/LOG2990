import { Component, OnInit } from '@angular/core';
import { Level, levels } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    page = 'selection';
    levels: Level[];
    currentPage: number = 0;
    levelsPerPage: number = Constants.levelsPerPage;
    firstShownLevel: number = 0;
    lastShownLevel = this.levelsPerPage;
    lastPage = Math.round(levels.length / this.levelsPerPage - 1);

    levelToShow: Level[];

    constructor(private communicationService: CommunicationService) {}

    nextPage(): void {
        if (this.currentPage < this.lastPage) this.currentPage++;
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    previousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    isBeginningOfList() {
        return this.currentPage <= 0;
    }

    isEndOfList() {
        return this.currentPage >= this.lastPage;
    }

    ngOnInit(): void {
        this.communicationService.getLevels('/image/AllLevels').subscribe((value) => {
            const data = value
            this.levels = [];
            for (const level of data) {
                this.levels.push(level);
            }
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
        });
    }
}
