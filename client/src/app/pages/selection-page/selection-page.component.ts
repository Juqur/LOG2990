import { Component, OnDestroy, OnInit } from '@angular/core';
import { LevelService } from '@app/services/level/level.service';
import { SelectionPageService } from '@app/services/selection-page/selection-page.service';

/**
 * This component represents the selection page, it is the page where the user selects which game to play
 * and in what game mode.
 *
 * @author Louis Félix St-Amour
 * @class SelectionPageComponent
 */
@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit, OnDestroy {
    constructor(public selectionPageService: SelectionPageService, public levelService: LevelService) {}

    ngOnInit(): void {
        this.selectionPageService.setupSocket(this.levelService);
        this.levelService.setupSocket();
        this.levelService.refreshLevels();
    }

    ngOnDestroy(): void {
        this.levelService.destroySocket();
    }
}
