import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audioService/audio.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

export interface GameData {
    differences: number[];
    amountOfDifferences: number;
    amountOfDifferencesSecondPlayer?: number;
}

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
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;
    @ViewChild('tempDiffPlayArea', { static: false }) tempDiffPlayArea!: PlayAreaComponent;

    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    closePath: string = '/selection';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    playerName: string;
    playerDifferencesCount: number = 0;
    secondPlayerName: string = '';
    secondPlayerDifferencesCount: number = 0;
    originalImageSrc: string = '';
    diffImageSrc: string = '';
    currentLevel: Level | undefined;

    private levelId: number;
    private clickedOriginalImage: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private route: ActivatedRoute,
        private router: Router,
        private socketHandler: SocketHandler,
        private gamePageService: GamePageService,
        private audioService: AudioService,
        private communicationService: CommunicationService,
    ) {}

    ngOnDestroy(): void {
        this.socketHandler.disconnect('game');
    }

    /**
     * This method is called when the component is initialized.
     * It subscribes to the router events to reset the counter when the user navigates to the game page, and to reset the socket information.
     * It also subscribes to the route parameters and query to get the level id and player name.
     * It also connects to the the game socket and handles the response.
     */
    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.levelId = params.id;
        });
        this.route.queryParams.subscribe((params) => {
            this.playerName = params['playerName'];
            this.secondPlayerName = params['opponent'];
        });

        this.router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                this.audioService.reset();
            }
        });

        try {
            this.communicationService.getLevel(this.levelId).subscribe((value) => {
                this.gamePageService.setNumberOfDifference(value.nbDifferences);
                this.currentLevel = value;
            });
        } catch (error) {
            throw new Error("Couldn't load level: " + error);
        }
        this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea);
        this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
        this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';

        this.handleSocket();
    }
    /**
     * This method handles the socket connection.
     * It connects to the game socket and sends the level id to the server.
     * It also handles the response from the server.
     * It checks if the difference is in the original image or in the diff image, and if the game is finished.
     */
    handleSocket() {
        this.socketHandler.on('game', 'onProcessedClick', (data) => {
            const gameData = data as GameData;
            if (gameData.amountOfDifferencesSecondPlayer) {
                this.secondPlayerDifferencesCount = gameData.amountOfDifferencesSecondPlayer;
            }
            this.playerDifferencesCount = gameData.amountOfDifferences;
            this.gamePageService.setDifferenceFound(gameData.amountOfDifferences);
            const response = this.gamePageService.validateResponse(gameData.differences);
            this.gamePageService.setImages(this.levelId);
            this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea);
            this.gamePageService.handleResponse(response, gameData, this.clickedOriginalImage);
        });
        this.socketHandler.on('game', 'onVictory', () => {
            this.gamePageService.handleVictory();
        });
        this.socketHandler.on('game', 'onDefeat', () => {
            this.gamePageService.handleDefeat();
        });
    }
    /**
     * This method handles the case where the user clicks on the original image
     * It will send the click to the server
     *
     * @param event The mouse event
     */
    clickedOnOriginal(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const mousePosition = this.mouseService.getMousePosition(event);
            if (!mousePosition) return;
            this.gamePageService.sendClick(mousePosition);
            this.clickedOriginalImage = true;
        }
    }
    /**
     * This method handles the case where the user clicks on the difference image
     * It will send the click to the server
     *
     * @param event The mouse event
     */
    clickedOnDiff(event: MouseEvent): void {
        if (this.mouseService.getCanClick()) {
            const mousePosition = this.mouseService.getMousePosition(event);
            if (!mousePosition) return;
            this.gamePageService.sendClick(mousePosition);
            this.clickedOriginalImage = false;
        }
    }

    // /**
    //  * The equivalent of eyedropper tool.
    //  *
    //  * @param x the x coordinate of the pixel
    //  * @param y the y coordinate of the pixel
    //  * @returns the rgba value of the pixel
    //  */
    // pick(x: number, y: number): string {
    //     const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     const pixel = context.getImageData(x, y, 1, 1);
    //     const data = pixel.data;

    //     const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / Constants.FULL_ALPHA})`;
    //     return rgba;
    // }

    // /**
    //  * This will copy an area of the original image to the difference canvas.
    //  * It will call pick function to get the rgba value of the pixel.
    //  *
    //  * @param area the area to copy
    //  */
    // copyArea(area: number[]): void {
    //     let x = 0;
    //     let y = 0;
    //     const context = this.tempDiffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     area.forEach((pixelData) => {
    //         x = (pixelData / Constants.PIXEL_SIZE) % this.originalPlayArea.width;
    //         y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);
    //         const rgba = this.pick(x, y);
    //         context.fillStyle = rgba;
    //         context.fillRect(x, y, 1, 1);
    //     });
    // }

    // /**
    //  * This method will redraw the canvas with the original image plus the elements that were not found.
    //  * To avoid flashing issue, it copies to a third temporary canvas.
    //  * which later in copyDiffPlayAreaContext we will copy the temporaryPlayArea to the diffPlayArea.
    //  */
    // resetCanvas(): void {
    //     this.diffPlayArea
    //         .timeout(Constants.millisecondsInOneSecond)
    //         .then(() => {
    //             this.tempDiffPlayArea.drawPlayArea(this.diffImageSrc);
    //             this.originalPlayArea.drawPlayArea(this.originalImageSrc);
    //             this.mouseService.changeClickState();
    //         })
    //         .then(() => {
    //             setTimeout(() => {
    //                 this.copyArea(this.imagesData);
    //             }, 0);
    //         })
    //         .then(() => {
    //             setTimeout(() => {
    //                 this.copyDiffPlayAreaContext();
    //             }, 0);
    //         });
    // }

    // /**
    //  * This method will copy/paste the context of the temp canvas to the difference canvas.
    //  */
    // copyDiffPlayAreaContext(): void {
    //     const contextTemp = this.tempDiffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     const context = this.diffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     const imageData = contextTemp.getImageData(0, 0, contextTemp.canvas.width, contextTemp.canvas.height);
    //     context.putImageData(imageData, 0, 0);
    // }

    // /**
    //  * Will be called when the user finds a difference in the difference canvas.
    //  *
    //  * @param result the current area found
    //  */
    // handleAreaFoundInDiff(result: number[]): void {
    //     AudioService.quickPlay('./assets/audio/success.mp3');
    //     this.imagesData.push(...result);
    //     this.diffPlayArea.flashArea(result);
    //     this.originalPlayArea.flashArea(result);
    //     this.mouseService.changeClickState();
    //     this.resetCanvas();
    // }

    // /**
    //  * Will be called when the user does not find a difference in the difference canvas.
    //  */
    // handleAreaNotFoundInDiff(): void {
    //     AudioService.quickPlay('./assets/audio/failed.mp3');
    //     this.drawServiceDiff.context = this.diffPlayArea
    //         .getCanvas()
    //         .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     this.drawServiceDiff.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
    //     this.mouseService.changeClickState();
    //     this.resetCanvas();
    // }

    // /**
    //  * Will be called when the user finds a difference in the original canvas.
    //  *
    //  * @param result the current area found
    //  */
    // handleAreaFoundInOriginal(result: number[]): void {
    //     AudioService.quickPlay('./assets/audio/success.mp3');
    //     this.imagesData.push(...result);
    //     this.originalPlayArea.flashArea(result);
    //     this.diffPlayArea.flashArea(result);
    //     this.mouseService.changeClickState();
    //     this.resetCanvas();
    // }

    // /**
    //  * Will be called when the user does not find a difference in the original canvas.
    //  */
    // handleAreaNotFoundInOriginal(): void {
    //     AudioService.quickPlay('./assets/audio/failed.mp3');
    //     this.drawServiceOriginal.context = this.originalPlayArea
    //         .getCanvas()
    //         .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    //     this.drawServiceOriginal.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
    //     this.mouseService.changeClickState();
    //     this.diffPlayArea.timeout(Constants.millisecondsInOneSecond).then(() => {
    //         this.originalPlayArea.drawPlayArea(this.originalImageSrc);
    //         this.mouseService.changeClickState();
    //     });
    // }

    // /**
    //  * Get the game level from the server when the game is loaded.
    //  */
    // getGameLevel(): void {
    //     this.levelId = this.route.snapshot.params.id;
    //     this.playerName = this.route.snapshot.queryParams.playerName;
    //     this.mouseService.resetCounter();

    //     this.settingGameLevel();
    //     this.settingGameImage();

    //     this.communicationService.postNewGame(String(this.levelId)).subscribe((gameId) => {
    //         this.gameId = gameId;
    //     });
    // }

    // /**
    //  * This method will set the game level.
    //  */
    // settingGameLevel(): void {
    //     try {
    //         this.communicationService.getLevel(this.levelId).subscribe((value) => {
    //             this.currentLevel = value;
    //             this.nbDiff = value.nbDifferences;
    //             this.mouseService.setNumberOfDifference(this.currentLevel.nbDifferences);
    //         });
    //     } catch (error) {
    //         throw new Error("Couldn't load level");
    //     }
    // }

    // /**
    //  * This method will set the game images.
    //  */
    // settingGameImage(): void {
    //     try {
    //         this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
    //         this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';
    //     } catch (error) {
    //         throw new Error("Couldn't load images");
    //     }
    // }
}
