/* eslint-disable max-lines */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DialogData } from '@app/interfaces/dialogs';
import { Vec2 } from '@app/interfaces/vec2';
import { AudioService } from '@app/services/audio/audio.service';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/interfaces/game-data';
import { environment } from 'src/environments/environment';

/**
 * This service contains all the logic for the game page.
 *
 * @author Junaid Qureshi & Pierre Tran
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
    private differencePlayArea: PlayAreaComponent;
    private tempDifferencePlayArea: PlayAreaComponent;
    private winGameDialogData: DialogData;
    private flashInterval: ReturnType<typeof setInterval>;
    private areaNotFound: number[];
    private closePath: string = '/home';
    private hintSection: number[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private mouseService: MouseService,
        private popUpService: PopUpService,
        private audioService: AudioService,
        private drawServiceDifference: DrawService,
        private drawServiceOriginal: DrawService,
    ) {}

    /**
     * Ensures the difference array is valid and not empty.
     *
     * @param differenceArray The array of different pixels.
     * @returns The validation of the click.
     */
    validateResponse(differenceArray: number[]): boolean {
        return differenceArray.length > 0;
    }

    /**
     * This method sets and updates the play areas of the game page.
     *
     * @param originalPlayArea The reference to the original play area.
     * @param differencePlayArea The reference to the diff play area.
     * @param tempDifferencePlayArea The reference to the temp diff play area.
     */
    setPlayArea(originalPlayArea: PlayAreaComponent, differencePlayArea: PlayAreaComponent, tempDifferencePlayArea: PlayAreaComponent): void {
        this.originalPlayArea = originalPlayArea;
        this.differencePlayArea = differencePlayArea;
        this.tempDifferencePlayArea = tempDifferencePlayArea;
    }

    /**
     * This methods sets the canClick property of the mouse service to a certain value.
     */
    setMouseCanClick(canClick: boolean): void {
        this.mouseService.canClick = canClick;
    }

    /**
     * This method verifies whether the click is valid or not.
     *
     * @param event The mouse event.
     * @returns The position of the mouse on the canvas.
     */
    verifyClick(event: MouseEvent): number {
        const invalid = -1;
        const mousePosition = this.mouseService.getMousePosition(event);
        this.mouseService.canClick = false;
        return mousePosition || invalid;
    }

    /**
     * This method reset the audio service.
     */
    resetAudio(): void {
        this.audioService.reset();
    }

    /**
     * This method reset the images data and the hintSection at the start of a new game.
     */
    resetImagesData(): void {
        this.imagesData = [];
        this.hintSection = [];
    }

    /**
     * This methods returns the image source url for both images.
     *
     * @param levelId The id of the level.
     */
    setImages(levelId: number): void {
        this.originalImageSrc = environment.serverUrl + 'original/' + levelId + '.bmp';
        this.diffImageSrc = environment.serverUrl + 'modified/' + levelId + '.bmp';
    }

    /**
     * This method handles the action to take depending on the response of validateResponse().
     *
     * @param response The response of validateResponse().
     * @param gameData The game data.
     * @param clickedOriginalImage Boolean that represents if the player clicked on the original image or the difference image.
     *
     * @returns Boolean that represents if the player clicked on a difference pixel or not.
     */
    handleResponse(isInCheatMode: boolean, gameData: GameData, clickedOriginalImage: boolean): boolean {
        const response = this.validateResponse(gameData.differencePixels);
        if (response) {
            if (!clickedOriginalImage) {
                this.handleAreaFoundInDiff(gameData.differencePixels, isInCheatMode);
            } else {
                this.handleAreaFoundInOriginal(gameData.differencePixels, isInCheatMode);
            }
            return true;
        } else {
            if (!clickedOriginalImage) {
                this.handleAreaNotFoundInDiff();
            } else {
                this.handleAreaNotFoundInOriginal();
            }
            return false;
        }
    }

    /**
     * This method is called when the player wins.
     * It will open a dialog and play a victory sound.
     */
    handleVictory(highscorePosition: number | null): void {
        let highscoreMessage = '';
        if (highscorePosition) {
            highscoreMessage = ' Vous avez obtenu la ' + highscorePosition + (highscorePosition === 1 ? 'ère' : 'e') + ' position du classement.';
        }
        this.winGameDialogData = {
            textToSend: 'Vous avez gagné!' + highscoreMessage,
            closeButtonMessage: 'Retour au menu principal',
            mustProcess: false,
        };
        this.popUpService.openDialog(this.winGameDialogData, this.closePath);
        AudioService.quickPlay('./assets/audio/Bing_Chilling_vine_boom.mp3');
    }

    /**
     * This method is called when the timed game is finished.
     * It will open a dialog and play a victory sound.
     *
     * @param finishedWithLastLevel Boolean that represents if the player finished the last level of the timed mode.
     */
    handleTimedModeFinished(finishedWithLastLevel: boolean): void {
        const timedGameFinishedDialogData: DialogData = {
            textToSend: finishedWithLastLevel
                ? 'La partie est terminée! Vous avez terminé le dernier niveau du mode à temps limité.'
                : 'La partie est terminée! Le temps est écoulé.',
            closeButtonMessage: 'Retour au menu principal',
            mustProcess: false,
        };
        this.popUpService.openDialog(timedGameFinishedDialogData, this.closePath);
        this.audioService.create('./assets/audio/Bing_Chilling_vine_boom.mp3');
        this.audioService.play();
    }

    /**
     * This method is called when other player abandons.
     * It will open a dialog and play a victory sound.
     */
    handleOpponentAbandon(): void {
        const opponentAbandonedGameDialogData: DialogData = {
            textToSend: 'Vous avez gagné! Votre adversaire a abandonné la partie.',
            closeButtonMessage: 'Retour au menu principal',
            mustProcess: false,
        };
        this.popUpService.openDialog(opponentAbandonedGameDialogData, this.closePath);
        this.audioService.create('./assets/audio/Bing_Chilling_vine_boom.mp3');
        this.audioService.play();
    }

    /**
     * This method is called when the player loses.
     * It will open a dialog and play a losing sound.
     */
    handleDefeat(): void {
        const loseDialogData: DialogData = {
            textToSend: 'Vous avez perdu!',
            closeButtonMessage: 'Retour au menu principal',
            mustProcess: false,
        };
        this.popUpService.openDialog(loseDialogData, this.closePath);
        AudioService.quickPlay('./assets/audio/LossSound.mp3');
    }

    /**
     * Method that initiates the cheat mode
     *
     * @param differences The differences to have flash
     */
    startCheatMode(differences: number[]): void {
        this.resetCanvas(false);
        let isVisible = false;
        this.areaNotFound = differences.filter((item) => {
            return !this.imagesData.includes(item);
        });
        this.flashInterval = setInterval(() => {
            if (isVisible) {
                this.differencePlayArea.deleteTempCanvas();
                this.originalPlayArea.deleteTempCanvas();
            } else {
                this.differencePlayArea.flashArea(this.areaNotFound);
                this.originalPlayArea.flashArea(this.areaNotFound);
            }
            isVisible = !isVisible;
        }, Constants.CHEAT_FLASHING_DELAY);
    }

    /**
     * Method that stops the cheat mode.
     */
    stopCheatMode(): void {
        clearInterval(this.flashInterval);
        this.areaNotFound = [];
        if (this.differencePlayArea && this.originalPlayArea) {
            this.differencePlayArea.deleteTempCanvas();
            this.originalPlayArea.deleteTempCanvas();
        }
    }

    /**
     * Prevents the player from joining the game if a page refreshes or tries to join again.
     * Redirects to the main menu.
     */
    preventJoining(): void {
        this.router.navigate(['/home']);
    }

    /**
     * Method that shows the first and second hint for the player on both canvas.
     *
     * @param section The quadrant or sub-quadrant in which the hint is
     */
    handleHintRequest(section: number[]): void {
        if (section.length < 1 || section.length > 2) {
            return;
        }
        this.originalPlayArea.drawPlayArea(this.originalImageSrc);
        this.differencePlayArea.drawPlayArea(this.diffImageSrc);
        setTimeout(() => {
            this.hintSection = section;
            this.drawServiceOriginal.context = this.originalPlayArea
                .getCanvas()
                .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.drawServiceOriginal.drawHintSection(this.hintSection);
            this.drawServiceDifference.context = this.differencePlayArea
                .getCanvas()
                .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
            this.drawServiceDifference.drawHintSection(this.hintSection);
        }, 0);
    }

    /**
     * Method that shows the third hint for the player on both canvas.
     *
     * @param shape An array of pixels that represents the shape of the difference.
     * Its last two elements are the width and height of the difference.
     * @param canvas The canvas on which the hint will be shown.
     */
    handleHintShapeRequest(shape: number[], canvas: HTMLCanvasElement): void {
        if (shape.length <= 2) {
            return;
        }
        this.hintSection = [];
        const height = shape.pop() as number;
        const width = shape.pop() as number;
        const differenceCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        differenceCanvasContext.canvas.height = height;
        differenceCanvasContext.canvas.width = width;

        let x = 0;
        let y = 0;
        shape.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % Constants.DEFAULT_WIDTH;
            y = Math.floor(pixelData / Constants.DEFAULT_WIDTH / Constants.PIXEL_SIZE);
            differenceCanvasContext.fillStyle = 'green';
            differenceCanvasContext.fillRect(x, y, 1, 1);
        });
        const widthScale = Constants.DEFAULT_WIDTH_SHAPE_CANVAS / width;
        const heightScale = Constants.DEFAULT_HEIGHT_SHAPE_CANVAS / height;
        const scale = Math.min(widthScale, heightScale);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const xOffset = (Constants.DEFAULT_WIDTH_SHAPE_CANVAS - scaledWidth) / 2;
        const yOffset = (Constants.DEFAULT_HEIGHT_SHAPE_CANVAS - scaledHeight) / 2;

        const shapeContext = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = Constants.DEFAULT_WIDTH_SHAPE_CANVAS;
        canvas.height = Constants.DEFAULT_HEIGHT_SHAPE_CANVAS;
        shapeContext.drawImage(differenceCanvasContext.canvas, xOffset, yOffset, scaledWidth, scaledHeight);
        this.originalPlayArea.drawPlayArea(this.originalImageSrc);
        this.differencePlayArea.drawPlayArea(this.diffImageSrc);
    }

    /**
     * The equivalent of eyedropper tool.
     * This method finds the rgba value of a pixel on the original image.
     *
     * @param x The x coordinate of the pixel.
     * @param y The y coordinate of the pixel.
     * @returns The rgba value of the pixel.
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
     * @param area The array of pixels that represents the area to copy.
     */
    private copyArea(area: number[]): void {
        let x = 0;
        let y = 0;
        const context = this.tempDifferencePlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
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
     * Later in copyDiffPlayAreaContext we will copy the temporaryPlayArea to the diffPlayArea.
     *
     * @param cooldown If true, the player will not be able to click on the canvas during the cooldown.
     */
    private resetCanvas(cooldown: boolean): void {
        this.mouseService.canClick = !cooldown;
        const delay = 1000; // ms
        this.differencePlayArea
            .timeout(delay)
            .then(() => {
                this.tempDifferencePlayArea.drawPlayArea(this.diffImageSrc);
                this.originalPlayArea.drawPlayArea(this.originalImageSrc);
            })
            .then(() => {
                setTimeout(() => {
                    this.copyArea(this.imagesData);
                    this.mouseService.canClick = true;
                }, 0);
            })
            .then(() => {
                setTimeout(() => {
                    this.differencePlayArea.deleteTempCanvas();
                    this.originalPlayArea.deleteTempCanvas();
                    this.copyDiffPlayAreaContext();
                    this.handleHintRequest(this.hintSection);
                }, 0);
            });
    }

    /**
     * This method will copy/paste the context of the temp canvas to the difference canvas.
     */
    private copyDiffPlayAreaContext(): void {
        const contextTemp = this.tempDifferencePlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const context = this.differencePlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const imageData = contextTemp.getImageData(0, 0, contextTemp.canvas.width, contextTemp.canvas.height);
        context.putImageData(imageData, 0, 0);
    }

    /**
     * Performs a success sound and flashes the area of the difference in the difference canvas.
     *
     * @param result The array of pixels that represents the area found as a difference.
     */
    private handleAreaFoundInDiff(result: number[], isInCheatMode: boolean): void {
        this.hintSection = [];
        if (isInCheatMode) {
            this.areaNotFound = this.areaNotFound.filter((item) => {
                return !result.includes(item);
            });
        }
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.differencePlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.resetCanvas(false);
    }

    /**
     * Performs a failed sound and prompts an error in the difference canvas.
     */
    private handleAreaNotFoundInDiff(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceDifference.context = this.differencePlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError(this.mouseService);
        this.resetCanvas(true);
    }

    /**
     * Performs a sound and flashes the area of the difference in the original canvas.
     *
     * @param result The array of pixels that represents the area found as a difference.
     */
    private handleAreaFoundInOriginal(result: number[], isInCheatMode: boolean): void {
        this.hintSection = [];
        if (isInCheatMode) {
            this.areaNotFound = this.areaNotFound.filter((item) => {
                return !result.includes(item);
            });
        }
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.differencePlayArea.flashArea(result);
        this.resetCanvas(false);
    }

    /**
     * Performs a failed sound and prompts an error in the original canvas.
     */
    private handleAreaNotFoundInOriginal(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError({ x: this.mouseService.x, y: this.mouseService.y } as Vec2);
        this.resetCanvas(true);
    }
}
