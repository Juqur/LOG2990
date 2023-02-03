import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseButton } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mousePosition: Vec2 = { x: 0, y: 0 };

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     */
    mouseHitDetect(event: MouseEvent) {
        // This is to test stuff, not meant for final product.
        window.alert(event.button);
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.processClick();
        }
    }

    /**
     * TODO
     * This function should process the click and react accordingly.
     * The information on the click should be sent to.
     *
     * @param time
     * @returns the time formatted
     */

    processClick() {}
}
