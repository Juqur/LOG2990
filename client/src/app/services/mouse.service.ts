import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Constants, MouseButton } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    differenceCounter: number = 0;
    mousePosition: Vec2 = { x: 0, y: 0 };
    url = ''; // The URL the service needs to send the value at.
    canClick: boolean = true;

    constructor(public http: HttpClient) {}

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     */
    mouseHitDetect(event: MouseEvent): boolean {
        // This is to test stuff, not meant for final product.
        // window.alert(event.button);
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.processClick();
        }
        return false;
    }

    /**
     * TODO
     * This function should process the click and react accordingly.
     * The information on the click should be sent to the server in order to
     * correctly process it there.
     */

    processClick(): boolean {
        if (this.canClick) {
            // The following commented code is to be used when server implementation has been completed.
            // const PIXEL_SIZE = 4;
            // const position: number = this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH
            // * Constants.PIXEL_SIZE;
            // TODO
            // Add router link
            // This is to send to the server at the appropriate path the position of the pixel that was clicked.
            // const res = this.http.post(url, position);
            const res: Vec2[] = [{ x: 1, y: 2 }];
            if (res.length > 0) {
                // Simply to add a section of the canvas that we can use to test on.
                if (
                    this.mousePosition.x > 0 &&
                    this.mousePosition.x < Constants.hundred &&
                    this.mousePosition.y > 0 &&
                    this.mousePosition.y < Constants.hundred
                ) {
                    this.incrementCounter();
                    return true;
                }
            }
            return false;
        }
        return false;
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

    getX(): number {
        return this.mousePosition.x;
    }

    getY(): number {
        return this.mousePosition.y;
    }

    /**
     * Swaps the state of the canClick attribute to it's opposite.
     */
    changeClickState(): void {
        this.canClick = !this.canClick;
    }
}
