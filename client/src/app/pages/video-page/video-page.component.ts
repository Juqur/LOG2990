import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Level } from '@app/levels';
import { DrawService } from '@app/services/draw/draw.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';

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
export class VideoPageComponent implements OnInit, AfterViewInit {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;

    @ViewChild('originalPlayArea2', { static: false }) originalPlayArea2!: PlayAreaComponent;
    @ViewChild('diffPlayArea2', { static: false }) diffPlayArea2!: PlayAreaComponent;

    @ViewChild('originalPlayArea3', { static: false }) originalPlayArea3!: PlayAreaComponent;
    @ViewChild('diffPlayArea3', { static: false }) diffPlayArea3!: PlayAreaComponent;

    // @ViewChild('originalPlayArea4', { static: false }) originalPlayArea4!: PlayAreaComponent;
    // @ViewChild('diffPlayArea4', { static: false }) diffPlayArea4!: PlayAreaComponent;

    // @ViewChild('originalPlayArea5', { static: false }) originalPlayArea5!: PlayAreaComponent;
    // @ViewChild('diffPlayArea5', { static: false }) diffPlayArea5!: PlayAreaComponent;

    // @ViewChild('originalPlayArea6', { static: false }) originalPlayArea6!: PlayAreaComponent;
    // @ViewChild('diffPlayArea6', { static: false }) diffPlayArea6!: PlayAreaComponent;

    // @ViewChild('originalPlayArea7', { static: false }) originalPlayArea7!: PlayAreaComponent;
    // @ViewChild('diffPlayArea7', { static: false }) diffPlayArea7!: PlayAreaComponent;

    nbDiff: number = Constants.INIT_DIFF_NB;
    hintPenalty: number = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    closePath: string = '/selection';
    diffCanvasCtx: CanvasRenderingContext2D | null = null;
    playerName: string = '';
    secondPlayerName: string | null = null;
    playerDifferencesCount: number = 0;
    secondPlayerDifferencesCount: number = 0;
    originalImageSrc: string = '';
    diffImageSrc: string = '';
    currentLevel: Level | undefined;

    private showVideo: ReturnType<typeof setInterval>;
    // private levelId: number;

    // eslint-disable-next-line max-params
    // constructor(private gamePageService: GamePageService) {}

    /**
     * This method is called when the component is initialized.
     * It sets the game level and the game image.
     * It also handles the pausing of any audio playing if the player decides to leave the page.
     * It also connects to the the game socket and handles the response.
     */
    ngOnInit(): void {
        this.settingGameParameters();
    }

    ngAfterViewInit(): void {
        this.settingGameImage();
    }

    putInCanvas(): void {
        if (VideoService.pointer >= VideoService.getStackLength()) {
            clearInterval(this.showVideo);
            return;
        }
        const frame = VideoService.getStackElement(VideoService.pointer++);
        console.log(frame);
        this.applyChanges(frame);
    }

    /**
     * After the undo or redo function has been called, this method will apply the changes to the canvas.
     *
     * @param canvas Takes 2 canvas, the default (left) canvas and the diff (right) canvas.
     */
    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined): void {
        if (!canvas) return;
        const defaultContext = this.originalPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffContext = this.diffPlayArea.canvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultContext.drawImage(canvas.defaultCanvas, 0, 0);
        diffContext.drawImage(canvas.diffCanvas, 0, 0);
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

    showLog(): void {
        console.log(VideoService.videoLog);
    }

    videoSpeedTime4(): void {
        clearInterval(this.showVideo);
        this.showVideo = setInterval(() => {
            this.putInCanvas();
        }, Constants.millisecondsInOneSecond / 4);
    }

    videoSpeedTime2(): void {
        clearInterval(this.showVideo);
        this.showVideo = setInterval(() => {
            this.putInCanvas();
        }, Constants.millisecondsInOneSecond / 2);
    }

    videoSpeedTime1(): void {
        clearInterval(this.showVideo);
        this.showVideo = setInterval(() => {
            this.putInCanvas();
        }, Constants.millisecondsInOneSecond);
    }

    pauseVideo(): void {
        clearInterval(this.showVideo);
    }

    /**
     * Settings the game parameters.
     * It sets the level id and the player names.
     */
    private settingGameParameters(): void {
        this.playerName = VideoService.getFirstPlayerName();
        this.secondPlayerName = VideoService.getSecondPlayerName();
    }

    /**
     * This method will set the game images.
     */
    private settingGameImage(): void {
        this.originalPlayArea.setContext(VideoService.getStackElement(0).defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        this.diffPlayArea.setContext(VideoService.getStackElement(0).diffCanvas.getContext('2d') as CanvasRenderingContext2D);

        this.originalPlayArea2.setContext(VideoService.getStackElement(1).defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        this.diffPlayArea2.setContext(VideoService.getStackElement(1).diffCanvas.getContext('2d') as CanvasRenderingContext2D);

        this.originalPlayArea3.setContext(VideoService.getStackElement(2).defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        this.diffPlayArea3.setContext(VideoService.getStackElement(2).diffCanvas.getContext('2d') as CanvasRenderingContext2D);

        // this.originalPlayArea4.setContext(VideoService.videoStack[3].defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        // this.diffPlayArea4.setContext(VideoService.videoStack[3].diffCanvas.getContext('2d') as CanvasRenderingContext2D);

        // this.originalPlayArea5.setContext(VideoService.videoStack[4].defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        // this.diffPlayArea5.setContext(VideoService.videoStack[4].diffCanvas.getContext('2d') as CanvasRenderingContext2D);

        // this.originalPlayArea6.setContext(VideoService.videoStack[5].defaultCanvas.getContext('2d') as CanvasRenderingContext2D);
        // this.diffPlayArea6.setContext(VideoService.videoStack[5].diffCanvas.getContext('2d') as CanvasRenderingContext2D);
    }
}
