import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Event, NavigationStart, Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audioService/audio.service';
import { CommunicationService } from '@app/services/communication.service';
import { DrawService } from '@app/services/draw.service';
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
 * @author Simon Gagné
 * @class GamePageComponent
 */
export class GamePageComponent implements OnInit {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;

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
    closePath: string = '/selection';
    gameId: string | null;

    // eslint-disable-next-line max-params
    constructor(
        private mouseService: MouseService,
        private route: ActivatedRoute,
        private communicationService: CommunicationService,
        private router: Router, // private audioService: AudioService,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // recoit le bon id!!
            this.levelId = params.id;
        });

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationStart) {
                this.mouseService.resetCounter();
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
                this.mouseService.setNumberOfDifference(this.currentLevel.nbDifferences);
            });
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            this.communicationService.getLevel(7).subscribe((value) => {
                this.currentLevel = value;
            });
        }

        try {
            this.originalImageSrc = environment.serverUrl + 'originals/' + this.levelId + '.bmp';
            this.diffImageSrc = environment.serverUrl + 'modifiees/' + this.levelId + '.bmp';
        } catch (error) {
            throw new Error("Couldn't load images");
        }

        this.communicationService.postNewGame('/game', String(this.levelId)).subscribe((gameId) => {
            this.gameId = gameId;
        });
    }

    clickedOnOriginal(event: MouseEvent) {
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

    clickedOnDiff(event: MouseEvent) {
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
        this.drawServiceDiff.drawError(this.mouseService);
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
        this.drawServiceOriginal.drawError(this.mouseService);
        this.mouseService.changeClickState();
        this.resetCanvas();
    }
}
