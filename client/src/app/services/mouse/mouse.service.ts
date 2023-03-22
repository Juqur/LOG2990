import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants, MouseButton } from '@common/constants';

/**
 * This service is used to get the position of the mouse in the canvas.
 *
 * @author Junaid Qureshi
 * @class MouseService
 */
@Injectable({
    providedIn: 'root',
})
export class MouseService {
    winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
        mustProcess: true,
    };
    closePath: string = '/selection';
    canClick: boolean = true;
    isRectangleMode: boolean = true;
    mouseDrawColor: string = 'black';
    private mousePosition: Vec2 = { x: 0, y: 0 };

    constructor(public popUpService: PopUpService) {}

    /**
     * Takes the mouse event to calculate the position of the mouse
     * and returns the absolute position of the mouse in the canvas.
     *
     * @param event The mouse event.
     * @returns The position of the mouse in the canvas.
     */
    getMousePosition(event: MouseEvent): number | null {
        if (event.button === MouseButton.Left && this.canClick) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH * Constants.PIXEL_SIZE;
        }
        return null;
    }

    /**
     * Returns the x coordinate of the last loaded click.
     *
     * @returns The value of the x coordinate.
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
     * Returns the mouse position.
     *
     * @param event the mouse event
     * @returns an empty array when promise is resolved.
     */
    async mouseDrag(event: MouseEvent): Promise<void> {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
        return Promise.resolve();
    }
}
