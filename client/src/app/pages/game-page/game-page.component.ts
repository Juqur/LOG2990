import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawService } from '@app/services/draw/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/game-data';
import { environment } from 'src/environments/environment';

/**
 * This component represents the game, it is the component that creates a game page.
 *
 * @author Simon Gagné et Galen Hu
 * @class GamePageComponent
 */
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
    providers: [DrawService, CommunicationService],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;
    @ViewChild('tempDiffPlayArea', { static: false }) tempDiffPlayArea!: PlayAreaComponent;
    @ViewChild('tempVideoOriginal') tempVideoOriginal!: PlayAreaComponent;
    @ViewChild('tempVideoDiff') tempVideoDiff!: PlayAreaComponent;

    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty: number = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    closePath: string = '/selection';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    playerName: string;
    playerDifferencesCount: number = 0;
    secondPlayerName: string;
    secondPlayerDifferencesCount: number = 0;
    originalImageSrc: string = '';
    diffImageSrc: string = '';
    currentLevel: Level | undefined;
    isInCheatMode: boolean = false;
    isReplayMode: boolean = false;

    private levelId: number;
    private clickedOriginalImage: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        private route: ActivatedRoute,
        private socketHandler: SocketHandler,
        private gamePageService: GamePageService,
        private communicationService: CommunicationService,
    ) {}

    /**
     * Listener for the key press event. It is called when ever we press on a key inside the game page.
     * In this specific case, we check if the key 't' was pressed and if to we toggle on and off the cheat mode.
     *
     * @param event The key up event.
     */
    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): void {
        if (event.key === 't' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
            if (!this.isInCheatMode) {
                this.socketHandler.send('game', 'onStartCheatMode');
                this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea, this.tempDiffPlayArea);
                this.gamePageService.setImages(this.levelId);
                this.isInCheatMode = !this.isInCheatMode;
                return;
            }
            this.isInCheatMode = !this.isInCheatMode;
            this.socketHandler.send('game', 'onStopCheatMode');
            this.gamePageService.stopCheatMode();
        }
    }

    /**
     * This method is called when the component is initialized.
     * It sets the game level and the game image.
     * It also handles the pausing of any audio playing if the player decides to leave the page.
     * It also connects to the the game socket and handles the response.
     */
    ngOnInit(): void {
        if (!this.socketHandler.isSocketAlive('game')) {
            this.gamePageService.preventJoining();
        }

        this.gamePageService.resetImagesData();
        this.settingGameParameters();
        this.handleSocket();
    }

    /**
     * This method is called when the component is destroyed.
     * It removes the listeners from the socket.
     */
    ngOnDestroy(): void {
        this.gamePageService.resetAudio();
        this.socketHandler.removeListener('game', 'processedClick');
        this.socketHandler.removeListener('game', 'victory');
        this.socketHandler.removeListener('game', 'defeat');
        this.socketHandler.removeListener('game', 'startCheatMode');
        this.gamePageService.stopCheatMode();
    }

    /**
     * This method handles the socket connection.
     * It connects to the game socket and sends the level id to the server.
     * It also handles the response from the server.
     * It checks if the difference is in the original image or in the diff image, and if the game is finished.
     * It checks if we have entered the cheat mode.
     */
    handleSocket(): void {
        this.socketHandler.on('game', 'processedClick', (data) => {
            const gameData = data as GameData;
            if (gameData.amountOfDifferencesFoundSecondPlayer !== undefined) {
                this.secondPlayerDifferencesCount = gameData.amountOfDifferencesFoundSecondPlayer;
            } else {
                this.playerDifferencesCount = gameData.amountOfDifferencesFound;
            }
            this.gamePageService.setImages(this.levelId);
            this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea, this.tempDiffPlayArea);
            this.gamePageService.handleResponse(this.isInCheatMode, gameData, this.clickedOriginalImage);
        });
        this.socketHandler.on('game', 'victory', () => {
            this.gamePageService.handleVictory(this.levelId, this.playerName, this.secondPlayerName);
        });
        this.socketHandler.on('game', 'opponentAbandoned', () => {
            this.gamePageService.handleOpponentAbandon();
        });
        this.socketHandler.on('game', 'defeat', () => {
            this.gamePageService.handleDefeat();
        });
        this.socketHandler.on('game', 'startCheatMode', (data) => {
            const differences = data as number[];
            this.gamePageService.startCheatMode(differences);
        });
    }

    /**
     * This method handles the case where the user clicks on the original image.
     * It will send the click to the server.
     *
     * @param event The mouse event.
     */
    clickedOnOriginal(event: MouseEvent): void {
        const mousePosition = this.gamePageService.verifyClick(event);
        if (mousePosition >= 0) {
            this.socketHandler.send('game', 'onClick', mousePosition);
            this.addToVideoStack();
            this.showToTempCanvas(VideoService.videoStack[VideoService.videoStack.length - 1]);
            this.clickedOriginalImage = true;
        }
    }

    /**
     * This method handles the case where the user clicks on the difference image.
     * It will send the click to the server.
     *
     * @param event The mouse event.
     */
    clickedOnDiff(event: MouseEvent): void {
        const mousePosition = this.gamePageService.verifyClick(event);
        if (mousePosition >= 0) {
            this.socketHandler.send('game', 'onClick', mousePosition);
            // VideoService.addToStack(mousePosition, false);
            this.addToVideoStack();
            this.clickedOriginalImage = false;
        }
    }

    addToVideoStack(): void {
        VideoService.addToVideoStack(
            this.originalPlayArea.canvas.nativeElement.getContext('2d'),
            this.diffPlayArea.canvas.nativeElement.getContext('2d'),
        );
    }

    showToTempCanvas(videoFrame: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement }): void {
        console.log(videoFrame);
        const defaultCtx = this.tempVideoOriginal.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffCtx = this.tempVideoDiff.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffCtx.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);

        defaultCtx.drawImage(videoFrame.defaultCanvas, 0, 0);
        diffCtx.drawImage(videoFrame.diffCanvas, 0, 0);
    }

    /**
     * This method emits a socket event if the player decides to abandon the game.
     */
    abandonGame(): void {
        this.socketHandler.send('game', 'onAbandonGame');
    }

    /**
     * Settings the game parameters.
     * It sets the level id and the player names.
     */
    private settingGameParameters(): void {
        this.levelId = this.route.snapshot.params.id;
        this.playerName = this.route.snapshot.queryParams.playerName;
        this.secondPlayerName = this.route.snapshot.queryParams.opponent;

        this.settingGameLevel();
        this.settingGameImage();
    }

    /**
     * This method will set the game level.
     */
    private settingGameLevel(): void {
        try {
            this.communicationService.getLevel(this.levelId).subscribe((value) => {
                this.currentLevel = value;
                this.nbDiff = value.nbDifferences;
            });
        } catch (error) {
            throw new Error("Couldn't load level");
        }
    }

    /**
     * This method will set the game images.
     */
    private settingGameImage(): void {
        this.originalImageSrc = environment.serverUrl + 'original/' + this.levelId + '.bmp';
        this.diffImageSrc = environment.serverUrl + 'modified/' + this.levelId + '.bmp';
    }
}
