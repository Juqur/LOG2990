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
 * @author Simon Gagné
 * @class GamePageComponent
 */
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;

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
        this.originalImageSrc = 'http://localhost:3000/originals/' + this.levelId + '.bmp';
        this.diffImageSrc = 'http://localhost:3000/modifiees/' + this.levelId + '.bmp';

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
}
