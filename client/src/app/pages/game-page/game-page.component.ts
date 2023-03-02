import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Event, NavigationStart, Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication.service';
import { DrawService } from '@app/services/draw.service';
import { MouseService } from '@app/services/mouse.service';
import { Constants } from '@common/constants';
import { AudioService } from '@app/services/audio.service';
import { Gateways, SocketHandler } from '@app/services/socket-handler.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
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
export class GamePageComponent implements OnInit {
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
    levelId: number;
    currentLevel: Level; // doit recuperer du server
    isClassicGamemode: boolean = true;
    isMultiplayer: boolean = false;
    nbDiff: number = Constants.INIT_DIFF_NB; // Il faudrait avoir cette info dans le level
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
        private router: Router,
        private audioService: AudioService,
        private socketHandler: SocketHandler,
        private gamePageService: GamePageService,
        private popUpService: PopUpServiceService,
    ) {}

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

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.gamePageService.resetCounter();
                if (this.socketHandler.isSocketAlive(Gateways.Game)) {
                    this.socketHandler.send(Gateways.Game, 'onJoinNewGame', this.levelId);
                }
                this.ngOnInit();
            }
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
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.communicationService.getLevel(7).subscribe((value) => {
                this.currentLevel = value;
            });
        }

        try {
            this.originalImageSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
            this.diffImageSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }
        this.handleSocket();
    }
    /**
     * This method handles the socket connection.
     * It connects to the game socket and sends the level id to the server.
     * It also handles the response from the server.
     * It checks if the difference is in the original image or in the diff image, and if the game is finished.
     */
    handleSocket() {
        if (!this.socketHandler.isSocketAlive(Gateways.Game)) {
            this.socketHandler.connect(Gateways.Game);
            this.socketHandler.send(Gateways.Game, 'onJoinNewGame', this.levelId);
            this.socketHandler.on(Gateways.Game, 'onProcessedClick', (data) => {
                const differenceArray = data as number[];
                const response = this.gamePageService.validateResponse(differenceArray);
                if (!this.defaultArea) {
                    if (response === 1) {
                        this.handleAreaFoundInDiff(differenceArray);
                    } else if (response === 0) {
                        this.handleAreaNotFoundInDiff();
                    }
                } else {
                    if (response === 1) {
                        this.handleAreaFoundInOriginal(differenceArray);
                    } else if (response === 0) {
                        this.handleAreaNotFoundInOriginal();
                    }
                }
                if (response === Constants.minusOne) {
                    this.popUpService.openDialog(this.winGameDialogData, this.closePath);
                    this.audioService.playSound('./assets/audio/Bing_Chilling_vine_boom.mp3');
                }
            });
        }
    }

    clickedOnOriginal(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const mousePosition = this.mouseService.getMousePosition(event);
            if (!mousePosition || !this.levelId) return;
            this.gamePageService.sendClick(mousePosition);
            this.defaultArea = true;
        }
    }

    clickedOnDiff(event: MouseEvent) {
        if (this.mouseService.getCanClick()) {
            const mousePosition = this.mouseService.getMousePosition(event);
            if (!mousePosition || !this.levelId) return;
            this.gamePageService.sendClick(mousePosition);
            this.defaultArea = false;
        }
    }

    pick(x: number, y: number): string {
        const context = this.originalPlayArea.getCanvas().nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const pixel = context.getImageData(x, y, 1, 1);
        const data = pixel.data;

        const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / Constants.FULL_ALPHA})`;
        return rgba;
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
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
        this.audioService.playSound('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.diffPlayArea.flashArea(result);
        this.originalPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
        this.foundADifference = true;
    }
    handleAreaNotFoundInDiff() {
        this.audioService.playSound('./assets/audio/failed.mp3');
        this.drawServiceDiff.context = this.diffPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceDiff.drawError(this.mouseService);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }
    handleAreaFoundInOriginal(result: number[]) {
        this.audioService.playSound('./assets/audio/success.mp3');
        this.imagesData.push(...result);
        this.originalPlayArea.flashArea(result);
        this.diffPlayArea.flashArea(result);
        this.mouseService.changeClickState();
        this.resetCanvas();
        this.foundADifference = true;
    }
    handleAreaNotFoundInOriginal() {
        this.audioService.playSound('./assets/audio/failed.mp3');
        this.drawServiceOriginal.context = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.drawServiceOriginal.drawError(this.mouseService);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }
}
