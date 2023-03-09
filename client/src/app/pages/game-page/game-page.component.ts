import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audioService/audio.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
<<<<<<< HEAD
import { SocketHandler } from '@app/services/socket-handler.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';

export interface GameData {
    differences: number[];
    amountOfDifferences: number;
    amountOfDifferencesSecondPlayer?: number;
}
=======
import { environment } from 'src/environments/environment';
>>>>>>> 2fec9a47f8952a9b69132256cdaf9d375ac349a1

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DrawService, CommunicationService],
})
/**
 * This component represents the game, it is the component that creates a game page.
 *
 * @author Simon Gagné
 * @class GamePageComponent
 */
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;

    winGameDialogData: DialogData = {
        textToSend: 'Vous avez gagné!',
        closeButtonMessage: 'Retour au menu de sélection',
    };
    closePath: string = '/selection';

    originalImageSrc: string = '';
    diffImageSrc: string = '';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;

    playerName: string;
    playerDifferencesCount: number = 0;
    secondPlayerName: string = '';
    secondPlayerDifferencesCount: number = 0;
    levelId: number;
    currentLevel: Level;
    isClassicGamemode: boolean = true;
    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    imagesData: number[] = [];
    defaultArea: boolean = true;
    diffArea: boolean = true;
    foundADifference = false;

    drawServiceDiff: DrawService = new DrawService();
    drawServiceOriginal: DrawService = new DrawService();

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private route: ActivatedRoute,
        private communicationService: CommunicationService,
        private socketHandler: SocketHandler,
        private gamePageService: GamePageService,
        private popUpService: PopUpServiceService,
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
        });

        try {
            this.communicationService.getLevel(this.levelId).subscribe((value) => {
                this.currentLevel = value;
                this.nbDiff = value.nbDifferences;
                this.gamePageService.setNumberOfDifference(this.currentLevel.nbDifferences);
            });
        } catch (error) {
            throw new Error("Couldn't load level: " + error);
        }

<<<<<<< HEAD
        this.originalImageSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
        this.diffImageSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';

        this.handleSocket();
=======
        try {
            this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
            this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }

        this.communicationService.postNewGame(String(this.levelId)).subscribe((gameId) => {
            this.gameId = gameId;
        });
>>>>>>> 2fec9a47f8952a9b69132256cdaf9d375ac349a1
    }
    /**
     * This method handles the socket connection.
     * It connects to the game socket and sends the level id to the server.
     * It also handles the response from the server.
     * It checks if the difference is in the original image or in the diff image, and if the game is finished.
     */
    handleSocket() {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.socketHandler.connect('game');
            this.socketHandler.on('game', 'onSecondPlayerJoined', (data) => {
                const names = data as string[];
                if (names[0] === this.playerName) {
                    this.secondPlayerName = names[1];
                } else {
                    this.secondPlayerName = names[0];
                }
            });
            this.socketHandler.on('game', 'onProcessedClick', (data) => {
                const gameData = data as GameData;
                if (gameData.amountOfDifferencesSecondPlayer) {
                    this.secondPlayerDifferencesCount = gameData.amountOfDifferencesSecondPlayer;
                }
                this.playerDifferencesCount = gameData.amountOfDifferences;
                this.gamePageService.setDifferenceFound(gameData.amountOfDifferences);
                const response = this.gamePageService.validateResponse(gameData.differences);
                if (!this.defaultArea) {
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
                    AudioService.quickPlay('./assets/audio/Bing_Chilling_vine_boom.mp3');
                }
            });
        }
        this.socketHandler.send('game', 'onJoinNewGame', { game: this.levelId, playerName: this.playerName });
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
            this.defaultArea = true;
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
            this.defaultArea = false;
        }
    }
    /**
     * This method returns the original pixel color
     *
     * @param x The x coordinate of the pixel
     * @param y The y coordinate of the pixel
     * @returns The color of the original pixel
     */
    pick(x: number, y: number): string {
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
    copyArea(area: number[]) {
        let x = 0;
        let y = 0;
        const context = this.diffPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        area.forEach((pixelData) => {
            x = (pixelData / Constants.PIXEL_SIZE) % this.originalPlayArea.width;
            y = Math.floor(pixelData / this.originalPlayArea.width / Constants.PIXEL_SIZE);
            const rgba = this.pick(x, y);
            if (!context) {
                return;
            }
            context.fillStyle = rgba;
            context.fillRect(x, y, 1, 1);
        });
    }
    /**
     * This method refreshes the difference canvas
     */
    resetCanvas() {
        this.diffPlayArea
            .timeout(Constants.millisecondsInOneSecond)
            .then(() => {
                this.diffPlayArea.drawPlayArea(this.diffImageSrc);
                this.originalPlayArea.drawPlayArea(this.originalImageSrc);
                this.mouseService.changeClickState();
            })
            .then(() => {
                setTimeout(() => {
                    this.copyArea(this.imagesData);
                }, Constants.thirty);
            });
    }

    handleAreaFoundInDiff(result: number[]) {
        AudioService.quickPlay('./assets/audio/success.mp3');

        // this.audioService.playSound('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.diffPlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
        this.foundADifference = true;
    }
    handleAreaNotFoundInDiff() {
        AudioService.quickPlay('./assets/audio/failed.mp3');

        // this.audioService.playSound('./assets/audio/failed.mp3');
        this.drawServiceDiff.context = this.diffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }
    handleAreaFoundInOriginal(result: number[]) {
        AudioService.quickPlay('./assets/audio/success.mp3');

        // this.audioService.playSound('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.diffPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
        this.foundADifference = true;
    }
    handleAreaNotFoundInOriginal() {
        AudioService.quickPlay('./assets/audio/failed.mp3');

        // this.audioService.playSound('./assets/audio/failed.mp3');
        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError({ x: this.mouseService.getX(), y: this.mouseService.getY() } as Vec2);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }
}
