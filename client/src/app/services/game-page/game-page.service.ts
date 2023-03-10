import { Injectable } from '@angular/core';
import { Constants } from '@common/constants';
import { SocketHandler } from '@app/services/socket-handler.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audioService/audio.service';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { Vec2 } from '@app/interfaces/vec2';
import { GameData } from '@app/pages/game-page/game-page.component';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';

@Injectable({
    providedIn: 'root',
})
/**
 * This service contains all the logic for the game page.
 *
 * @author Junaid Qureshi
 * @class GamePageService
 */
export class GamePageService {
    private numberOfDifference: number = 0;
    private differencesFound: number = 0;
    private imagesData: number[] = [];
    private originalImageSource: string = '';
    private diffImageSource: string = '';
    private drawServiceDiff: DrawService;
    private drawServiceOriginal: DrawService;
    private originalPlayArea: PlayAreaComponent;
    private diffPlayArea: PlayAreaComponent;
    private winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    private closePath: string = '/selection';

    // eslint-disable-next-line max-params
    constructor(
        private socketHandler: SocketHandler,
        private communicationService: CommunicationService,
        private mouseService: MouseService,
        private popUpService: PopUpService,
        private audioService: AudioService,
    ) {}
    /**
     * This method validates validates the click of a plyer after it has been checked by the server.
     *
     * @param differenceArray array of different pixels
     * @returns an integer that represents the state of the click, 1 if the click is valid, 0 if the click is invalid and -1 if the game is over
     */
    validateResponse(differenceArray: number[]): number {
        if (differenceArray.length > 0 && differenceArray[0] !== Constants.minusOne) {
            return this.differencesFound === this.numberOfDifference ? Constants.minusOne : 1;
        }
        return 0;
    }

    /**
     * This methods sets and updates the play areas of the game page.
     *
     * @param originalPlayArea reference to the original play area
     * @param diffPlayArea reference to the diff play area
     */
    setPlayArea(originalPlayArea: PlayAreaComponent, diffPlayArea: PlayAreaComponent): void {
        this.originalPlayArea = originalPlayArea;
        this.diffPlayArea = diffPlayArea;
    }

    /**
     * This method sends the click to the server.
     *
     * @param position position of the click
     */
    sendClick(position: number): void {
        this.socketHandler.send('game', 'onClick', { position });
    }

    setNumberOfDifference(nbDiff: number): void {
        this.numberOfDifference = nbDiff;
    }

    setDifferenceFound(nbDiff: number): void {
        this.differencesFound = nbDiff;
    }

    /**
     * This method the pictures to the correct sources.
     * It also gets the level information from the server.
     *
     * @param levelId The id of the level
     * @returns a level object that contains the level information if the level was found, undefined otherwise
     */
    getLevelInformation(levelId: number): Level | undefined {
        this.originalImageSource = 'http://localhost:3000/originals/' + levelId + '.bmp';
        this.diffImageSource = 'http://localhost:3000/modifiees/' + levelId + '.bmp';
        let level: Level | undefined;
        try {
            this.communicationService.getLevel(levelId).subscribe((value) => {
                this.setNumberOfDifference(value.nbDifferences);
                level = value;
            });
        } catch (error) {
            throw new Error("Couldn't load level: " + error);
        }
        return level;
    }

    /**
     * This method handles the action to take depending on the response of validateResponse()
     *
     * @param response Integer that represents the state of the click, 1 if the click is valid, 0 if the click is invalid and -1 if the game is over
     * @param gameData Values of the game
     * @param clickedOriginalImage boolean that represents if the player clicked on the original image or the difference image
     */
    handleResponse(response: number, gameData: GameData, clickedOriginalImage: boolean): void {
        if (!clickedOriginalImage) {
            if (response !== 0) {
                this.handleAreaFoundInDiff(gameData.differences);
            } else {
                this.handleAreaNotFoundInDiff();
            }
        } else {
            if (response !== 0) {
                this.handleAreaFoundInOriginal(gameData.differences);
            } else {
                this.handleAreaNotFoundInOriginal();
            }
        }
        if (response === Constants.minusOne) {
            this.popUpService.openDialog(this.winGameDialogData, this.closePath);
            this.audioService.create('./assets/audio/Bing_Chilling_vine_boom.mp3');
            this.audioService.reset();
            this.audioService.play();
        }
    }

    /**
     * This method handles the case where the player clicked on the difference image and a difference was found.
     *
     * @param result list of different pixels
     */
    private handleAreaFoundInDiff(result: number[]) {
        AudioService.quickPlay('./assets/audio/success.mp3');

        this.imagesData.push(...result);
        this.diffPlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * This method handles the case where the player clicked on the difference image and no difference was found.
     */
    private handleAreaNotFoundInDiff() {
        AudioService.quickPlay('./assets/audio/failed.mp3');

        this.drawServiceDiff.context = this.diffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * This method handles the case where the player clicked on the original image and a difference was found.
     *
     * @param result list of different pixels
     */
    private handleAreaFoundInOriginal(result: number[]) {
        AudioService.quickPlay('./assets/audio/success.mp3');

        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.diffPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * This method handles the case where the player clicked on the original image but no difference was found.
     */
    private handleAreaNotFoundInOriginal() {
        AudioService.quickPlay('./assets/audio/failed.mp3');

        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * This method returns the original pixel color
     *
     * @param x The x coordinate of the pixel
     * @param y The y coordinate of the pixel
     * @returns The color of the original pixel
     */
    private pick(x: number, y: number): string {
        const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const pixel = context.getImageData(x, y, 1, 1);
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / Constants.FULL_ALPHA})`;
        return rgba;
    }

    /**
     * This method copies the area found in the original image to the difference image
     *
     * @param area The area to be copied
     */
    private copyArea(area: number[]) {
        let x = 0;
        let y = 0;
        const context = this.diffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        if (!context) {
            return;
        }
        area.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % this.originalPlayArea.width;
            y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);
            const rgba = this.pick(x, y);
            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }
    /**
     * This method refreshes the difference canvas
     */
    private resetCanvas() {
        this.diffPlayArea
            .timeout(Constants.millisecondsInOneSecond)
            .then(() => {
                this.diffPlayArea.drawPlayArea(this.diffImageSource);
                this.originalPlayArea.drawPlayArea(this.originalImageSource);
                this.mouseService.changeClickState();
            })
            .then(() => {
                setTimeout(() => {
                    this.copyArea(this.imagesData);
                }, Constants.thirty);
            });
    }
}
