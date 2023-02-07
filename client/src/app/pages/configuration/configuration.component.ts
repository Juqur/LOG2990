import { Component } from '@angular/core';
import { Level, levels } from '@app/levels';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent {
    levels = [...levels];
    currentPage: number = 0;
    levelsPerPage: number = Constants.levelsPerPage;
    firstShownLevel: number = 0;
    lastShownLevel = this.levelsPerPage;
    lastPage = Math.round(levels.length / this.levelsPerPage - 1);
    showGlobalVariable = false;
    levelToShow: Level[] = this.levels.slice(this.firstShownLevel, this.lastShownLevel);

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
}
