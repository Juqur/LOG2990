import { Component, OnInit } from '@angular/core';
import { LevelService } from '@app/services/levelService/level.service';
import { SelectionPageService } from '@app/services/selectionPageService/selection-page.service';

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
export class SelectionPageComponent implements OnInit {
    constructor(public selectionPageService: SelectionPageService, public levelService: LevelService) {}
    /**
     * This method is called when the component is initialized.
     * It sets up the socket.
     */
    ngOnInit(): void {
        this.selectionPageService.setupSocket(this.levelService);
    }
}
