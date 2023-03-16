import { Component, Input } from '@angular/core';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

/**
 * Component that allows to display top 3 times
 * of a level in solo and multiPlayer mode one at a time
 *
 * @author Galen Hu
 * @class CarouselComponent
 */
@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent {
    @Input() level: Level = {
        id: 0,
        name: 'no name',
        playerSolo: ['player 1', 'player 2', 'player 3'],
        timeSolo: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        playerMulti: ['player 1', 'player 2', 'player 3'],
        timeMulti: [Constants.minusOne, Constants.minusOne, Constants.minusOne],
        isEasy: true,
        nbDifferences: 7,
    };

    selectedButton: string = 'solo';

    /**
     * Formats the time to a MM:SS format.
     *
     * @param time the time to format
     * @returns the time in MM:SS format.
     */
    formatTime(time: number): string {
        const minutes: number = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds: number = time % Constants.SECONDS_PER_MINUTE;

        const minutesString: string = minutes < Constants.PADDING_NUMBER ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.PADDING_NUMBER ? '0' + seconds : seconds.toString();
        return minutesString + ':' + secondsString;
    }

    /**
     * Change the button from solo to multi
     *
     * @param button that is active
     */
    changeButtonStyle(button: string): void {
        if (button === 'solo') {
            this.selectedButton = 'solo';
        } else {
            this.selectedButton = 'multi';
        }
    }
}
