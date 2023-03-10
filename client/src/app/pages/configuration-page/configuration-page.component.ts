import { Component } from '@angular/core';
import { LevelService } from '@app/services/levelService/level.service';

@Component({
    selector: 'app-configuration-page',
    templateUrl: './configuration-page.component.html',
    styleUrls: ['./configuration-page.component.scss'],
})
/**
 * This component represents the page where the user can modify, delete or create new games. It is accessible from
 * a button inside the main page component and can redirect to the creation page.
 *
 * @author Louis Félix St-Amour, Galen Hu & Simon Gagné
 * @class Configuration Component
 */
export class ConfigurationPageComponent {
    constructor(public levelService: LevelService) {}
}
