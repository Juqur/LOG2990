import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { Constants, MouseButton } from '@common/constants';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    private differenceCounter: number = 0;
    private mousePosition: Vec2 = { x: 0, y: 0 };
    // private url = ''; // The URL the service needs to send the value at.
    private canClick: boolean = true;
    // private arrayOfDifference: number[] = [];
    constructor(private communicationService: CommunicationService) {}

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     * @returns a boolean indicating if the click was valid.
     */
    async mouseHitDetect(event: MouseEvent): Promise<number[]> {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.processClick();
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
    async processClick(): Promise<number[]> {
        // let foundDifference: Promise<boolean> = Promise.resolve(false);
        if (this.getCanClick()) {
            const url = '/image/difference';
            // This is to send to the server at the appropriate path the position of the pixel that was clicked.
            const position: number =
                this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH * Constants.PIXEL_SIZE;

            const differencesArray = await this.getDifferencesArray(url, position);

            if (differencesArray.length > 0) {
                this.incrementCounter();
                return differencesArray;
            }
        }
        return [];
    }

    async getDifferencesArray(url: string, position: number) {
        return await lastValueFrom(this.communicationService.postDifference(url, '7', position));
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
}
