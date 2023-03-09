import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Constants, MouseButton } from '@common/constants';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    private mousePosition: Vec2 = { x: 0, y: 0 };
    private canClick: boolean = true;

    /**
     * Takes the mouse event to calculate the position of the mouse
     * and returns the absolute position of the mouse in the canvas.
     *
     * @param event the mouse event
     * @returns the position of the mouse in the canvas
     */
    getMousePosition(event: MouseEvent) {
        if (event.button === MouseButton.Left && this.canClick) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH * Constants.PIXEL_SIZE;
        }
        return null;
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
