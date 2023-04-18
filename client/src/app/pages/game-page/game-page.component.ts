import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DrawService } from '@app/services/draw/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/interfaces/game-data';
import { Level } from '@common/interfaces/level';
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
    @ViewChild('originalPlayArea', { static: false }) private originalPlayArea!: PlayAreaComponent;
    @ViewChild('differencePlayArea', { static: false }) private differencePlayArea!: PlayAreaComponent;
    @ViewChild('tempDifferencePlayArea', { static: false }) private tempDifferencePlayArea!: PlayAreaComponent;
    @ViewChild('hintShapeCanvas', { static: false }) private hintShapeCanvas!: ElementRef<HTMLCanvasElement>;

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
    isClassic: boolean = true;
    showThirdHint: boolean = false;

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
     * In this specific case, we check if the key 't' was pressed and if to we toggle on and off the cheat mode,
     * if the key 'i' was pressed we ask for a hint.
     *
     * @param event The key up event.
     */
    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): void {
        if ((event.key === 't' || event.key === 'T') && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
            if (!this.isInCheatMode) {
                this.socketHandler.send('game', 'onStartCheatMode');
                this.gamePageService.setPlayArea(this.originalPlayArea, this.differencePlayArea, this.tempDifferencePlayArea);
                this.gamePageService.setImages(this.levelId);
                this.isInCheatMode = !this.isInCheatMode;
                return;
            }
            this.isInCheatMode = !this.isInCheatMode;
            this.socketHandler.send('game', 'onStopCheatMode');
            this.gamePageService.stopCheatMode();
        }
        if (event.key === 'i' || event.key === 'I') {
            this.askForHint();
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
        this.gamePageService.setMouseCanClick(true);
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
        this.socketHandler.removeListener('game', 'timedModeFinished');
        this.socketHandler.removeListener('game', 'opponentAbandoned');
        this.socketHandler.removeListener('game', 'changeLevelTimedMode');
        this.socketHandler.removeListener('game', 'hintRequest');
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
            if (this.isClassic || gameData.differencePixels.length === 0) {
                this.gamePageService.setImages(this.levelId);
                this.gamePageService.setPlayArea(this.originalPlayArea, this.differencePlayArea, this.tempDifferencePlayArea);
                const isFound = this.gamePageService.handleResponse(this.isInCheatMode, gameData, this.clickedOriginalImage);
                if (isFound && this.showThirdHint) {
                    this.removeHintShape();
                }
            }
        });
        this.socketHandler.on('game', 'victory', () => {
            this.gamePageService.handleVictory();
        });
        this.socketHandler.on('game', 'opponentAbandoned', () => {
            this.gamePageService.handleOpponentAbandon();
        });
        this.socketHandler.on('game', 'defeat', () => {
            this.gamePageService.handleDefeat();
        });
        this.socketHandler.on('game', 'timedModeFinished', (finishedWithLastLevel: boolean) => {
            if (finishedWithLastLevel) this.playerDifferencesCount++;
            this.gamePageService.handleTimedModeFinished(finishedWithLastLevel);
        });
        this.socketHandler.on('game', 'startCheatMode', (differences: number[]) => {
            this.gamePageService.startCheatMode(differences);
        });
        this.socketHandler.on('game', 'hintRequest', (data) => {
            const section = data as number[];
            this.gamePageService.setImages(this.levelId);
            this.gamePageService.setPlayArea(this.originalPlayArea, this.differencePlayArea, this.tempDifferencePlayArea);
            if (section.length < 3 && this.nbHints > 1) {
                this.gamePageService.handleHintRequest(section);
                this.nbHints--;
            } else if (this.nbHints === 1) {
                this.gamePageService.handleHintShapeRequest(section, this.hintShapeCanvas.nativeElement);
                this.nbHints--;
                this.showThirdHint = true;
            }
        });
        this.socketHandler.on('game', 'changeLevelTimedMode', (level: Level) => {
            this.levelId = level.id;
            this.currentLevel = level;
            this.settingGameImage();
            this.gamePageService.resetImagesData();
            this.gamePageService.setMouseCanClick(true);
            this.gamePageService.setImages(this.levelId);
            if (this.showThirdHint) this.removeHintShape();
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
            this.clickedOriginalImage = false;
        }
    }

    /**
     * This method emits a socket event to request a hint to the server.
     */
    askForHint(): void {
        if (!this.secondPlayerName) {
            this.gamePageService.setPlayArea(this.originalPlayArea, this.differencePlayArea, this.tempDifferencePlayArea);
            this.socketHandler.send('game', 'onHintRequest');
        }
    }

    /**
     * This method clears the hint shape canvas.
     */
    removeHintShape(): void {
        const shapeCanvas = this.hintShapeCanvas.nativeElement as HTMLCanvasElement;
        const shapeCtx = shapeCanvas.getContext('2d') as CanvasRenderingContext2D;
        shapeCtx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        this.showThirdHint = false;
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
        if (this.route.snapshot.params.id === '0') {
            this.isClassic = false;
            return;
        }

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
