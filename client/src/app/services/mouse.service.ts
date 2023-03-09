import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { Constants, MouseButton } from '@common/constants';
<<<<<<< HEAD
=======
import { lastValueFrom } from 'rxjs';
import { AudioService } from './audioService/audio.service';
import { CommunicationService } from './communicationService/communication.service';
import { DialogData, PopUpService } from './popUpService/pop-up.service';
>>>>>>> 2fec9a47f8952a9b69132256cdaf9d375ac349a1

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    private mousePosition: Vec2 = { x: 0, y: 0 };
    private canClick: boolean = true;
<<<<<<< HEAD
=======
    private numberOfDifference: number = 0;
    private endGameAudio = new AudioService();

    constructor(
        private communicationService: CommunicationService,
        public popUpService: PopUpService /* private socketHandler: SocketHandler */,
        router: Router,
    ) {
        router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                this.endGameAudio.reset();
            }
        });
    }
>>>>>>> 2fec9a47f8952a9b69132256cdaf9d375ac349a1

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
