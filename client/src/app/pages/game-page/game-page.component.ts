import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audioService/audio.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DrawService, CommunicationService],
})
/**
 * This component represents the game, it is the component that creates a game page.
 *
 * @author Simon Gagné et Galen Hu
 * @class GamePageComponent
 */
export class GamePageComponent implements OnInit {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;
    @ViewChild('tempDiffPlayArea', { static: false }) tempDiffPlayArea!: PlayAreaComponent;

    originalImageSrc: string = '';
    diffImageSrc: string = '';

    playerName: string;
    levelId: number;
    currentLevel: Level;
    isClassicGamemode: boolean = true;
    isMultiplayer: boolean = false;
    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    imagesData: number[] = [];
    defaultArea: boolean = true;
    diffArea: boolean = true;

    drawServiceDiff: DrawService = new DrawService();
    drawServiceOriginal: DrawService = new DrawService();
    closePath: string = '/selection';
    gameId: string | null;

    tempCanvasContext: CanvasRenderingContext2D;

    constructor(private mouseService: MouseService, private route: ActivatedRoute, private communicationService: CommunicationService) {}

    ngOnInit(): void {
        this.getGameLevel();
    }

    /**
     * When the user clicks on the original image, this method is called.
     * It will detect if the user clicked on a difference and if so, it will call the handleAreaFoundInOriginal method.
     * If the user did not click on a difference, it will call the handleAreaNotFoundInOriginal method.
     *
     * @param event
     */
    clickedOnOriginal(event: MouseEvent): void {
        if (this.mouseService.getCanClick()) {
            // Update this so it also does game id work.
            const diffDetected = this.mouseService.mouseHitDetect(event, this.gameId);
            diffDetected.then((result) => {
                if (result.length > 0) {
                    this.handleAreaFoundInOriginal(result);
                } else {
                    this.handleAreaNotFoundInOriginal();
                }
            });
        }
    }

    /**
     * This method is called when the user clicks on the difference canvas.
     * It will call handleAreaFoundInDiff if the user clicked on a difference.
     * If the user did not click on a difference, it will call handleAreaNotFoundInDiff.
     *
     * @param event
     */
    clickedOnDiff(event: MouseEvent): void {
        if (this.mouseService.getCanClick()) {
            const diffDetected = this.mouseService.mouseHitDetect(event, this.gameId);
            diffDetected.then((result) => {
                if (result.length > 0) {
                    this.handleAreaFoundInDiff(result);
                } else {
                    this.handleAreaNotFoundInDiff();
                }
            });
        }
    }

    /**
     * The equivalent of eyedropper tool.
     *
     * @param x the x coordinate of the pixel
     * @param y the y coordinate of the pixel
     * @returns the rgba value of the pixel
     */
    pick(x: number, y: number): string {
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
    copyArea(area: number[]): void {
        let x = 0;
        let y = 0;
        const context = this.tempDiffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
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
    resetCanvas(): void {
        this.diffPlayArea
            .timeout(Constants.millisecondsInOneSecond)
            .then(() => {
                this.tempDiffPlayArea.drawPlayArea(this.diffImageSrc);
                this.originalPlayArea.drawPlayArea(this.originalImageSrc);
                this.mouseService.changeClickState();
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
    copyDiffPlayAreaContext(): void {
        const contextTemp = this.tempDiffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const context = this.diffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const imageData = contextTemp.getImageData(0, 0, contextTemp.canvas.width, contextTemp.canvas.height);
        context.putImageData(imageData, 0, 0);
    }

    /**
     * Will be called when the user finds a difference in the difference canvas.
     *
     * @param result the current area found
     */
    handleAreaFoundInDiff(result: number[]): void {
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.diffPlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * Will be called when the user does not find a difference in the difference canvas.
     */
    handleAreaNotFoundInDiff(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceDiff.context = this.diffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * Will be called when the user finds a difference in the original canvas.
     *
     * @param result the current area found
     */
    handleAreaFoundInOriginal(result: number[]): void {
        AudioService.quickPlay('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.diffPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }

    /**
     * Will be called when the user does not find a difference in the original canvas.
     */
    handleAreaNotFoundInOriginal(): void {
        AudioService.quickPlay('./assets/audio/failed.mp3');
        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
            this.originalPlayArea.drawPlayArea(this.originalImageSrc);
            this.mouseService.changeClickState();
        });
    }

    /**
     * Get the game level from the server when the game is loaded.
     */
    getGameLevel(): void {
        this.levelId = this.route.snapshot.params.id;
        this.playerName = this.route.snapshot.queryParams.playerName;
        this.mouseService.resetCounter();

        this.settingGameLevel();
        this.settingGameImage();

        this.communicationService.postNewGame(String(this.levelId)).subscribe((gameId) => {
            this.gameId = gameId;
        });
    }

    /**
     * This method will set the game level.
     */
    settingGameLevel(): void {
        try {
            this.communicationService.getLevel(this.levelId).subscribe((value) => {
                this.currentLevel = value;
                this.nbDiff = value.nbDifferences;
                this.mouseService.setNumberOfDifference(this.currentLevel.nbDifferences);
            });
        } catch (error) {
            throw new Error("Couldn't load level");
        }
    }

    /**
     * This method will set the game images.
     */
    settingGameImage(): void {
        try {
            this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
            this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }
    }
}
