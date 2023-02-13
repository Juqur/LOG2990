import { Component, Input } from '@angular/core';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})

/**
 * Component that displays a preview
 * of a level and its difficulty
 *
 * @author Galen HU
 * @class CardComponent
 */
export class CardComponent {
    @Input() level: Level = {
        id: -1,
        image: '',
        name: '',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        isEasy: true,
        route: 'no route',
    };

    @Input() page: string = 'no page';

    difficulty: string;

    /**
     * Display the difficulty of the level
     *
     * @returns the path difficulty image
     */
    displayDifficultyIcon(): string {
        if (this.level.isEasy) {
            return '../../../assets/images/easy.png';
        } else {
            return '../../../assets/images/hard.png';
        }
    }
}
