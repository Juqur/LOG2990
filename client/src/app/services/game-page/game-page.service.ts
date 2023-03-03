import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';
import { SocketHandler } from '@app/services/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GamePageService {
    private numberOfDifference: number = 0;
    private differencesFound: number = 0;
    constructor(private socketHandler: SocketHandler) {}

    validateResponse(differenceArray: number[]): number {
        if (differenceArray.length > 0 && differenceArray[0] !== Constants.minusOne) {
            if (this.differencesFound === this.numberOfDifference) {
                return Constants.minusOne;
            }
            return 1;
        } else {
            return 0;
        }
    }

    sendClick(position: number): void {
        this.socketHandler.send('game', 'onClick', { position });
    }

    setNumberOfDifference(nbDiff: number): void {
        this.numberOfDifference = nbDiff;
    }

    setDifferenceFound(nbDiff: number): void {
        this.differencesFound = nbDiff;
    }
}
