import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseButton } from '@common/constants';
import { AudioService } from './audioService/audio.service';
import { DialogData, PopUpService } from './popUpService/pop-up.service';

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

    isRectangleMode: boolean = true;
    mouseDrawColor: string = 'black';
    private mousePosition: Vec2 = { x: 0, y: 0 };
    private endGameAudio = new AudioService();
    constructor(public popUpService: PopUpService, router: Router) {
        router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                this.endGameAudio.reset();
            }
        });
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
