import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { CommunicationService } from '@app/services/communication.service';
import { Constants, MouseButton } from '@common/constants';
import { DialogData, PopUpServiceService } from './pop-up-service.service';
import { Gateways, SocketHandler } from './socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagnez!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    closePath: string = '/selection';

    private differenceCounter: number = 0;
    private mousePosition: Vec2 = { x: 0, y: 0 };
    // private url = ''; // The URL the service needs to send the value at.
    private canClick: boolean = true;
    private test: string;

    constructor(private communicationService: CommunicationService, public popUpService: PopUpServiceService, private socketHandler: SocketHandler) {
        if (!this.socketHandler.isSocketAlive(Gateways.Difference)) {
            this.socketHandler.connect(Gateways.Difference);
            this.socketHandler.on(
                'sendCoord',
                (data: unknown) => {
                    this.test = data as string;
                },
                Gateways.Difference,
            );
        }
    }

    /**
     * Takes a mouse event in order to calculate the position of the mouse
     * and stores it inside tbe mousePosition variable.
     *
     * @param event the mouse event
     * @returns a boolean indicating if the click was valid.
     */
    mouseHitDetect(event: MouseEvent): boolean {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return this.processClick();
        }
        return false;
    }

    /**
     * This function should process the click and react accordingly.
     * The information on the click should be sent to the server in order to
     * correctly process it there.
     *
     * @returns a boolean indicating if the click was valid.
     */
    processClick(): boolean {
        if (this.getCanClick()) {
            const url = '/image/difference';
            // This is to send to the server at the appropriate path the position of the pixel that was clicked.
            const position: number =
                this.mousePosition.x * Constants.PIXEL_SIZE + this.mousePosition.y * Constants.DEFAULT_WIDTH * Constants.PIXEL_SIZE;

            let differencesArray: number[] = [];
            this.communicationService.postDifference(url, '7', position).subscribe((tempDifferencesArray) => {
                differencesArray = tempDifferencesArray;
            });
            this.socketHandler.send(Gateways.Difference, 'receiveClick', 'Hello from client');

            if (differencesArray.length !== 0) {
                if (differencesArray[0] === Constants.minusOne) {
                    this.popUpService.openDialog(this.winGameDialogData, this.closePath);
                }
                // TODO Gérer la suppression de la différence.
            }
            const testRes: Vec2[] = this.getTestVariable();
            if (testRes.length > 0) {
                // Simply to add a section of the canvas that we can use to test on.
                if (this.getX() > 0 && this.getX() < Constants.hundred && this.getY() > 0 && this.getY() < Constants.hundred) {
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

    private getTestVariable(): Vec2[] {
        return [{ x: 1, y: 2 }];
    }
}
