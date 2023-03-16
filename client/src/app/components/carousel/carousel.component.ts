import { Component, Input } from '@angular/core';
import { Level } from '@app/levels';
import { Constants } from '@common/constants';

/**
 * Component that allows to display top 3 times
 * of a level in solo and multiPlayer mode one at a time.
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
    @Input() level: Level = Constants.DEFAULT_LEVEL;
    selectedButton: string = 'solo';

    /**
     * Formats the time to a MM:SS format.
     *
     * @param time The time to format.
     * @returns The time in MM:SS format.
     */
    formatTime(time: number): string {
        const minutes: number = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds: number = time % Constants.SECONDS_PER_MINUTE;

        const minutesString: string = minutes < Constants.PADDING_NUMBER ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.PADDING_NUMBER ? '0' + seconds : seconds.toString();
        return minutesString + ':' + secondsString;
    }

    /**
     * Changes the button from solo to multiplayer.
     *
     * @param The button that is active.
     */
    changeButtonStyle(button: string): void {
        this.selectedButton = button === 'solo' ? 'solo' : 'multi';
    }
}
