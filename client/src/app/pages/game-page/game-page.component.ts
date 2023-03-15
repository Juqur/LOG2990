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

    /**
     * This method is called when the component is initialized.
     * It sets the game level and the game image.
     * It also handles the pausing of any audio playing if the player decides to leave the page.
     * It also connects to the the game socket and handles the response.
     */
    ngOnInit(): void {
        this.router.events.forEach((event) => {
            if (event instanceof NavigationStart) {
                this.audioService.reset();
            }
        });
        this.gamePageService.resetImagesData();
        this.getGameLevel();
        this.handleSocket();
    }

    ngOnDestroy(): void {
        this.socketHandler.disconnect('game');
    }

    abandon(): void {
        this.socketHandler.send('game', 'onAbandon');
        this.router.navigate([this.closePath]);
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
            const response = this.gamePageService.validateResponse(gameData.differences);
            this.gamePageService.setImages(this.levelId);
            this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea, this.tempDiffPlayArea);
            this.gamePageService.handleResponse(response, gameData, this.clickedOriginalImage);
        });
        this.socketHandler.on('game', 'opponentAbandoned', () => {
            this.gamePageService.handleOpponentAbandon();
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

    /**
     * Get the game level from the server when the game is loaded.
     */
    getGameLevel(): void {
        this.levelId = this.route.snapshot.params.id;
        this.playerName = this.route.snapshot.queryParams.playerName;
        this.secondPlayerName = this.route.snapshot.queryParams.opponent;

        this.settingGameLevel();
        this.settingGameImage();
    }

    /**
     * This method will set the game level.
     */
    settingGameLevel(): void {
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
    settingGameImage(): void {
        try {
            this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
            this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }
    }
}
