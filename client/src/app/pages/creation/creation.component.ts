import { Component } from '@angular/core';
import { CreationPageService } from '@app/services/creationPageService/creation-page.service';

@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
})
/**
 * This component represents the creation, the page where we can create new levels/games.
 *
 * @author Simon Gagné
 * @class CreationComponent
 */
export class CreationComponent {
    constructor(public creationService: CreationPageService) {}
}
