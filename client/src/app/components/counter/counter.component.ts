import { Component } from '@angular/core';
import { GamePageService } from '@app/services/game-page/game-page.service';

@Component({
    selector: 'app-counter',
    templateUrl: './counter.component.html',
    styleUrls: ['./counter.component.scss'],
})

/**
 * Component acting as a display for the number of differences found in a game.
 *
 * @author Galen Hu & Charles Degrandpré
 * @class CounterComponent
 */
export class CounterComponent {
    constructor(private gamePageService: GamePageService) {}

    /**
     * Returns the value of the counter from the mouseService.
     *
     * @returns the value of the counter.
     */
    get mouseCount() {
        return this.gamePageService.getDifferenceCounter();
    }
}
