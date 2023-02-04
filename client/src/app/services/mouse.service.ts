import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseButton } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    differenceCounter: number = 0;
    mousePosition: Vec2 = { x: 0, y: 0 };
    width: number;
    url = ''; // The URL the service needs to send the value at.

    constructor(public http: HttpClient) {}

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     */
    mouseHitDetect(event: MouseEvent, width: number) {
        // This is to test stuff, not meant for final product.
        this.width = width;
        // window.alert(event.button);
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.processClick();
        }
    }

    /**
     * TODO
     * This function should process the click and react accordingly.
     * The information on the click should be sent to the server in order to
     * correctly process it there.
     */

    processClick() {
        // const PIXEL_SIZE = 4;
        // const position: number = this.mousePosition.x * PIXEL_SIZE + this.mousePosition.y * this.width * PIXEL_SIZE;
        // TODO
        // Add router link
        // This is to send to the server at the appropriate path the position of the pixel that was clicked.
        // const res = this.http.post(url, position);
        const res: Vec2[] = [{ x: 1, y: 2 }];
        if (res.length > 0) {
            this.incrementCounter();
        }
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
}
