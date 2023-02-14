import { Component, OnInit } from '@angular/core';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
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

    previousPage(): void {
        if (this.currentPage > 0) this.currentPage--;
        this.firstShownLevel = this.currentPage * Constants.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + Constants.levelsPerPage;
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
            this.levels = value;

            this.lastShownLevel = Constants.levelsPerPage;
            this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
            this.lastPage = Math.round(this.levels.length / Constants.levelsPerPage - 1);
        });
    }
}
