import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { VideoChatComponent } from '@app/components/video-chat/video-chat.component';
import { Level } from '@app/levels';
import { VideoService } from '@app/services/video/video.service';
import { ChatMessage } from '@common/chat-messages';
import { Constants } from '@common/constants';

/**
 * This is the replay video page component.
 *
 * @author Galen Hu
 * @class VideoPageComponent
 */
@Component({
    selector: 'app-video-page',
    templateUrl: './video-page.component.html',
    styleUrls: ['./video-page.component.scss'],
    providers: [],
})
export class VideoPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) originalPlayArea!: PlayAreaComponent;
    @ViewChild('diffPlayArea', { static: false }) diffPlayArea!: PlayAreaComponent;
    @ViewChild('videoChat', { static: false }) videoChat!: VideoChatComponent;

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
    videoSpeed: number = Constants.NORMAL_SPEED;
    timeFrame: number = 0;
    lastTimeFrame: number = 0;
    messageCount: number = 0;

    private showVideo: ReturnType<typeof setInterval>;

    /**
     * This method is called when the component is initialized.
     * It sets the game level and the game image.
     * It also handles the pausing of any audio playing if the player decides to leave the page.
     * It also connects to the the game socket and handles the response.
     */
    ngOnInit(): void {
        this.settingGameParameters();
        this.lastTimeFrame = VideoService.getStackElement(VideoService.getStackLength() - 1).time;
        console.table(VideoService.messageStack);
    }

    ngAfterViewInit(): void {
        this.settingGameImage();
    }

    ngOnDestroy(): void {
        VideoService.resetStack();
    }

    /**
     * Put the frame in the canvas.
     *
     * @returns
     */
    putInCanvas(): void {
        if (VideoService.pointer >= VideoService.getStackLength()) {
            clearInterval(this.showVideo);
            return;
        }
        const frame = VideoService.getStackElement(VideoService.pointer++);
        // console.log(frame);
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

    /**
     * This method is called when the user clicks on the start video button.
     */
    startVideo(): void {
        this.playVideo();
    }

    /**
     * Get the first player name.
     *
     * @returns the first player name.
     */
    getFirstPlayerName(): string {
        return VideoService.getFirstPlayerName();
    }

    /**
     * Get the second player name.
     *
     * @returns the second player name.
     */
    getSecondPlayerName(): string {
        return VideoService.getSecondPlayerName();
    }

    /**
     * This method is called when the user clicks on the times 4 button.
     */
    videoSpeedTime4(): void {
        this.videoSpeed = Constants.VERY_FAST_SPEED;
    }

    /**
     * This method is called when the user clicks on the times 2 button.
     */
    videoSpeedTime2(): void {
        this.videoSpeed = Constants.FAST_SPEED;
    }

    /**
     * This method is called when the user clicks on the times 1 button.
     */
    videoSpeedTime1(): void {
        this.videoSpeed = Constants.NORMAL_SPEED;
    }

    /**
     * This method is called when we have to play the video.
     */
    playVideo(): void {
        let videoFrame = VideoService.getStackElement(VideoService.pointer);
        let messageFrame = VideoService.getMessagesStackElement(this.messageCount);
        this.showVideo = setInterval(() => {
            if (this.timeFrame >= this.lastTimeFrame) {
                this.pauseVideo();
            }
            if (this.timeFrame === videoFrame.time) {
                this.putInCanvas();
                if (videoFrame.found) ++this.playerDifferencesCount;
                videoFrame = VideoService.getStackElement(VideoService.pointer);
            }
            if (this.timeFrame <= VideoService.messageStack[VideoService.messageStack.length - 1].time && this.timeFrame === messageFrame.time) {
                this.addToChat(messageFrame.chatMessage);
                messageFrame = VideoService.getMessagesStackElement(++this.messageCount);
            }
            this.timeFrame++;
        }, Constants.TIMER_INTERVAL / this.videoSpeed);
    }

    /**
     * This method will add the next text to the chat.
     *
     * @param chatMessage the next text to be added to the chat.
     */
    addToChat(chatMessage: ChatMessage): void {
        this.videoChat.addMessage(chatMessage);
    }

    /**
     * This method will pause the video.
     */
    pauseVideo(): void {
        clearInterval(this.showVideo);
    }

    /**
     * This method will replay the video from the beginning.
     */
    replayVideo(): void {
        clearInterval(this.showVideo);
        VideoService.pointer = 0;
        this.timeFrame = -1;
        this.playerDifferencesCount = 0;
        this.playVideo();
    }

    /**
     * After returning to the home page, the game stack will be reset.
     */
    returnHome(): void {
        clearInterval(this.showVideo);
        VideoService.resetStack();
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
    }
}
