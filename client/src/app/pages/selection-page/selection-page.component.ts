import { Component } from '@angular/core';
import { Level, levels } from '@app/levels';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
    levels = [...levels];
    currentPage:number = 0;
    levelsPerPage:number = 4;
    firstShownLevel:number = 0;
    lastShownLevel = this.levelsPerPage;
    lastPage = levels.length / this.levelsPerPage - 1;

    levelToShow : Level[] = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    nextPage(): void {
        if (this.currentPage < this.lastPage)
            this.currentPage++;
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
        this.levelToShow= this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

    previousPage(): void {
        if (this.currentPage > 0)
            this.currentPage--;
        this.firstShownLevel = this.currentPage * this.levelsPerPage;
        this.lastShownLevel = this.firstShownLevel + this.levelsPerPage;
        this.levelToShow = this.levels.slice(this.firstShownLevel, this.lastShownLevel);
    }

}
