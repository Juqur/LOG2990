import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { DrawService } from '@app/services/draw/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';

/**
 * This component represents the game, it is the component that creates a game page.
 *
 * @author Galen Hu
 * @class VideoPageComponent
 */
@Component({
    selector: 'app-video-page',
    templateUrl: './video-page.component.html',
    styleUrls: ['./video-page.component.scss'],
    providers: [DrawService],
})
export class VideoPageComponent implements OnInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;
    @ViewChild('tempDiffPlayArea', { static: false }) tempDiffPlayArea!: PlayAreaComponent;

    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty: number = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    closePath: string = '/selection';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    playerName: string;
    secondPlayerName: string;
    playerDifferencesCount: number = 0;
    secondPlayerDifferencesCount: number = 0;
    originalImageSrc: string = '';
    diffImageSrc: string = '';
    currentLevel: Level | undefined;
    isInCheatMode: boolean = false;
    clickedOriginalImage: boolean = true;

    private showVideo: ReturnType<typeof setInterval>;
    private levelId: number;

    // eslint-disable-next-line max-params
    constructor(private route: ActivatedRoute, private gamePageService: GamePageService) {}

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
                this.gamePageService.setPlayArea(this.originalPlayArea, this.diffPlayArea, this.tempDiffPlayArea);
                this.gamePageService.setImages(this.levelId);
                this.isInCheatMode = !this.isInCheatMode;
                return;
            }
            this.isInCheatMode = !this.isInCheatMode;
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
        this.gamePageService.resetImagesData();
        this.settingGameParameters();
    }

    /**
     * This method is called when the component is destroyed.
     * It removes the listeners from the socket.
     */
    ngOnDestroy(): void {
        this.gamePageService.resetAudio();
        this.gamePageService.stopCheatMode();
    }

    putInCanvas(): void {
        // if (VideoService.isStackEmpty()) {
        //     clearInterval(this.showVideo);
        //     return;
        // }
        // const frame = VideoService.popStack() as unknown as { clickedOnOriginal: boolean; mousePosition: number };
        // if (frame.clickedOnOriginal) {
        //     this.originalPlayArea.simulateClick(frame.mousePosition);
        // } else if (!frame.clickedOnOriginal) {
        //     this.diffPlayArea.simulateClick(frame.mousePosition);
        // }
        if (VideoService.isStackEmpty()) {
            clearInterval(this.showVideo);
            return;
        }
        const frame = VideoService.popStack() as unknown as { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement };
        this.applyChanges(frame);
    }

    /**
     * After the undo or redo function has been called, this method will apply the changes to the canvas.
     *
     * @param canvas Takes 2 canvas, the default (left) canvas and the diff (right) canvas.
     */
    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined): void {
        if (!canvas) return;
        const defaultContex = this.originalPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffContex = this.diffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultContex.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);
        diffContex.clearRect(0, 0, Constants.DEFAULT_WIDTH, Constants.DEFAULT_HEIGHT);

        defaultContex.drawImage(canvas.defaultCanvas, 0, 0);
        diffContex.drawImage(canvas.diffCanvas, 0, 0);
    }


    startVideo(): void {
        this.showVideo = setInterval(() => {
            this.putInCanvas();
        }, Constants.millisecondsInOneSecond);
    }

    getFirstPlayerName(): string {
        return VideoService.getFirstPlayerName();
    }

    getSecondPlayerName(): string {
        return VideoService.getSecondPlayerName();
    }

    /**
     * Settings the game parameters.
     * It sets the level id and the player names.
     */
    private settingGameParameters(): void {
        this.levelId = this.route.snapshot.params.id;
        this.playerName = VideoService.getFirstPlayerName();
        this.secondPlayerName = VideoService.getSecondPlayerName();

        this.settingGameImage();
    }

    /**
     * This method will set the game images.
     */
    private settingGameImage(): void {
        this.originalImageSrc = environment.serverUrl + 'original/' + this.levelId + '.bmp';
        this.diffImageSrc = environment.serverUrl + 'modified/' + this.levelId + '.bmp';
    }
}
