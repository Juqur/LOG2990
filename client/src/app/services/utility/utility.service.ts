import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';

/**
 * This service provides general utility methods.
 * All methods must be static.
 *
 * @author Pierre Tran & Charles Degrandpré
 * @class UtilityService
 */
@Injectable({
    providedIn: 'root',
})
export class UtilityService {
    /**
     * Formats the time to a MM:SS format.
     *
     * @param time The time to format.
     * @returns The time in MM:SS format.
     */
    static formatTime(time: number): string {
        const minutes: number = Math.floor(time / Constants.SECONDS_PER_MINUTE);
        const seconds: number = time % Constants.SECONDS_PER_MINUTE;

        const minutesString: string = minutes < Constants.PADDING_NUMBER ? '0' + minutes : minutes.toString();
        const secondsString: string = seconds < Constants.PADDING_NUMBER ? '0' + seconds : seconds.toString();
        return minutesString + ':' + secondsString;
    }
}
