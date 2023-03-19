import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { GameData } from '@app/pages/game-page/game-page.component';
import { AudioService } from '@app/services/audioService/audio.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

/**
 * This service contains all the logic for the game page.
 *
 * @author Junaid Qureshi
 * @class GamePageService
 */
@Injectable({
    providedIn: 'root',
})
export class GamePageService {
    private imagesData: number[] = [];
    private originalImageSrc: string = '';
    private diffImageSrc: string = '';
    private originalPlayArea: PlayAreaComponent;
    private diffPlayArea: PlayAreaComponent;
    private tempDiffPlayArea: PlayAreaComponent;
    private winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    private loseDialogData: DialogData = {
        textToSend: 'Vous avez perdu!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    private closePath: string = '/selection';

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private popUpService: PopUpService,
        private audioService: AudioService,
        private drawServiceDiff: DrawService,
        private drawServiceOriginal: DrawService,
    ) {}
    /**
     * This method validates validates the click of a plyer after it has been checked by the server.
     *
     * @param differenceArray array of different pixels
     * @returns whether the click was valid or not
     */
    validateResponse(differenceArray: number[]): boolean {
        return differenceArray.length > 0;
    }

    /**
     * This methods sets and updates the play areas of the game page.
     *
     * @param originalPlayArea reference to the original play area
     * @param diffPlayArea reference to the diff play area
     */
    setPlayArea(originalPlayArea: PlayAreaComponent, diffPlayArea: PlayAreaComponent, tempDiffPlayArea: PlayAreaComponent): void {
        this.originalPlayArea = originalPlayArea;
        this.diffPlayArea = diffPlayArea;
        this.tempDiffPlayArea = tempDiffPlayArea;
    }

    /**
     * This method verifies whether the click is valid or not.
     *
     * @param event The mouse event.
     */
    verifyClick(event: MouseEvent): number {
        const mousePosition = this.mouseService.getMousePosition(event);
        this.mouseService.setClickState(false);
        if (!mousePosition) return Constants.minusOne;
        return mousePosition;
    }

    resetAudio(): void {
        this.audioService.reset();
    }

    /**
     * This method reset the images data at the start of a new game.
     */
    resetImagesData(): void {
        this.imagesData = [];
    }

    /**
     * This method the pictures to the correct sources.
     *
     * @param levelId The id of the level
     */
    setImages(levelId: number): void {
        this.originalImageSrc = environment.serverUrl + 'original/' + levelId + '.bmp';
        this.diffImageSrc = environment.serverUrl + 'modified/' + levelId + '.bmp';
    }

    /**
     * This method handles the action to take depending on the response of validateResponse()
     * +
     *
     * @param response Integer that represents the state of the click, 1 if the click is valid, 0 if the click is invalid and -1 if the game is over
     * @param gameData Values of the game
     * @param clickedOriginalImage boolean that represents if the player clicked on the original image or the difference image
     */
    handleResponse(response: boolean, gameData: GameData, clickedOriginalImage: boolean): void {
        if (!clickedOriginalImage) {
            if (response) {
                this.handleAreaFoundInDiff(gameData.differencePixels);
            } else {
                this.handleAreaNotFoundInDiff();
            }
        } else {
            if (response) {
                this.handleAreaFoundInOriginal(gameData.differencePixels);
            } else {
                this.handleAreaNotFoundInOriginal();
            }
        }
    }

    /**
     * This method is called when the player wins.
     * It will open a dialog and play a sound.
     */
    handleVictory(): void {
        this.popUpService.openDialog(this.winGameDialogData, this.closePath);
        this.audioService.create('./assets/audio/Bing_Chilling_vine_boom.mp3');
        this.audioService.reset();
        this.audioService.play();
    }

    /**
     * This method is called when the player wins.
     * It will open a dialog and play a sound.
     */
    handleDefeat(): void {
        this.popUpService.openDialog(this.loseDialogData, this.closePath);
        this.audioService.create('./assets/audio/LossSound.mp3');
        this.audioService.reset();
        this.audioService.play();
    }

    /**
     * This method finds the rgba value of a pixel on the original image.
     *
     * @param x the x coordinate of the pixel
     * @param y the y coordinate of the pixel
     * @returns the rgba value of the pixel
     */
    private pick(x: number, y: number): string {
        const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const pixel = context.getImageData(x, y, 1, 1);
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / Constants.FULL_ALPHA})`;
        return rgba;
    }

    /**
     * This will copy an area of the original image to the difference canvas.
     * It will call pick function to get the rgba value of the pixel.
     *
     * @param area the area to copy
     */
    private copyArea(area: number[]): void {
        let x = 0;
        let y = 0;
        const context = this.tempDiffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        if (context === null) return;
        area.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % this.originalPlayArea.width;
            y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);
            const rgba = this.pick(x, y);
            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }

    /**
     * This method will redraw the canvas with the original image plus the elements that were not found.
     * To avoid flashing issue, it copies to a third temporary canvas.
     * which later in copyDiffPlayAreaContext we will copy the temporaryPlayArea to the diffPlayArea.
     */
    private resetCanvas(): void {
        this.diffPlayArea
            .timeout(Constants.millisecondsInOneSecond)
            .then(() => {
                this.tempDiffPlayArea.drawPlayArea(this.diffImageSrc);
                this.originalPlayArea.drawPlayArea(this.originalImageSrc);
                this.mouseService.setClickState(true);
            })
            .then(() => {
                setTimeout(() => {
                    this.copyArea(this.imagesData);
                }, 0);
            })
            .then(() => {
                setTimeout(() => {
                    this.copyDiffPlayAreaContext();
                }, 0);
            });
    }

    /**
     * This method will copy/paste the context of the temp canvas to the difference canvas.
     */
    private copyDiffPlayAreaContext(): void {
        const contextTemp = this.tempDiffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const context = this.diffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const imageData = contextTemp.getImageData(0, 0, contextTemp.canvas.width, contextTemp.canvas.height);
        context.putImageData(imageData, 0, 0);
    }

    /**
     * Will be called when the user finds a difference in the difference canvas.
     *
     * @param result the current area found
     */
    private handleAreaFoundInDiff(result: number[]): void {
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.diffPlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.resetCanvas();
    }

    /**
     * Will be called when the user does not find a difference in the difference canvas.
     */
    private handleAreaNotFoundInDiff(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceDiff.context = this.diffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.resetCanvas();
    }

    /**
     * Will be called when the user finds a difference in the original canvas.
     *
     * @param result the current area found
     */
    private handleAreaFoundInOriginal(result: number[]): void {
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.diffPlayArea.flashArea(result);
        this.resetCanvas();
    }

    /**
     * Will be called when the user does not find a difference in the original canvas.
     */
    private handleAreaNotFoundInOriginal(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
            this.originalPlayArea.drawPlayArea(this.originalImageSrc);
            this.mouseService.setClickState(true);
        });
    }
}
