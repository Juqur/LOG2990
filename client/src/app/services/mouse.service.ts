import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioService } from '@app/services/audio.service';
import { Constants, MouseButton } from '@common/constants';
import { lastValueFrom } from 'rxjs';
import { CommunicationService } from './communication.service';
import { DialogData, PopUpServiceService } from './popUpService/pop-up-service.service';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    closePath: string = '/selection';

    private differenceCounter: number = 0;
    private mousePosition: Vec2 = { x: 0, y: 0 };
    // private url = ''; // The URL the service needs to send the value at.
    private canClick: boolean = true;
    private numberOfDifference: number = 0;

    constructor(
        private communicationService: CommunicationService,
        public popUpService: PopUpServiceService /* private socketHandler: SocketHandler */,
        private audioService: AudioService,
    ) {}

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     * @returns a boolean indicating if the click was valid.
     */
    async mouseHitDetect(event: MouseEvent, gameId: string | null): Promise<number[]> {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.processClick(gameId);
        }
        return Promise.resolve([]);
    }
    /**
     * This function should process the click and react accordingly.
     * The information on the click should be sent to the server in order to
     * correctly process it there.
     *
     * @returns a boolean indicating if the click was valid.
     */
    async processClick(gameId: string | null): Promise<number[]> {
        // let foundDifference: Promise<boolean> = Promise.resolve(false);
        if (this.getCanClick()) {
            const position: number =
                this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH * Constants.PIXEL_SIZE;

            const differencesArray = await this.getDifferencesArray(position, gameId);
            if (differencesArray.length > 0) {
                this.incrementCounter();
                if (this.getDifferenceCounter() >= this.numberOfDifference) {
                    this.popUpService.openDialog(this.winGameDialogData, this.closePath);
                    this.audioService.playSound('./assets/audio/Bing_Chilling_vine_boom.mp3');
                }
                return differencesArray;
            }
        }
        return [];
    }

    async getDifferencesArray(position: number, gameId: string | null) {
        return await lastValueFrom(this.communicationService.postDifference(gameId, position));
    }

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     */
    incrementCounter() {
        this.differenceCounter++;
    }

    /**
     * Returns the difference counter.
     *
     * @returns the difference counter
     */
    getDifferenceCounter() {
        return this.differenceCounter;
    }

    /**
     * Returns the x coordinate of the last loaded click.
     *
     * @returns the value of the x coordinate.
     */
    getX(): number {
        return this.mousePosition.x;
    }

    /**
     * Returns the y coordinate of the last loaded click.
     *
     * @returns the value of the y coordinate.
     */
    getY(): number {
        return this.mousePosition.y;
    }

    /**
     * Swaps the state of the canClick attribute to it's opposite.
     */
    changeClickState(): void {
        this.canClick = !this.canClick;
    }

    /**
     * Returns the boolean indicating if a click can be processed.
     *
     * @returns the canClick boolean.
     */
    getCanClick(): boolean {
        return this.canClick;
    }

    /**
     * Sets the number of difference to the given value.
     *
     * @param numberOfDifference the number of difference to set.
     * @returns void
     * */
    setNumberOfDifference(numberOfDifference: number): void {
        this.numberOfDifference = numberOfDifference;
    }

    resetCounter(): void {
        this.differenceCounter = 0;
    }
}
