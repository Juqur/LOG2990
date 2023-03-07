import { Component } from '@angular/core';
import { CreationPageService } from '@app/services/creationPageService/creation-page.service';

/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné
 * @class CreationComponent
 */
@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
export class CreationComponent {
    constructor(public creationService: CreationPageService) {}
}
