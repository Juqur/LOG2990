import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { VideoChatComponent } from '@app/components/video-chat/video-chat.component';
import { VideoTimerComponent } from '@app/components/video-timer/video-timer.component';
import { Level } from '@app/levels';
import { AudioService } from '@app/services/audio/audio.service';
import { DialogData, PopUpService } from '@app/services/pop-up/pop-up.service';
import { TimerService } from '@app/services/timer/timer.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';
import { ChatMessage } from '@common/interfaces/chat-messages';

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
    providers: [TimerService],
})
export class VideoPageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('originalPlayArea', { static: false }) private originalPlayArea!: PlayAreaComponent;
    @ViewChild('differencePlayArea', { static: false }) private differencePlayArea!: PlayAreaComponent;
    @ViewChild('videoChat', { static: false }) private videoChat!: VideoChatComponent;
    @ViewChild('videoTimer', { static: false }) private videoTimer!: VideoTimerComponent;

    hintPenalty: number = Constants.HINT_PENALTY;
    nbHints: number = Constants.INIT_HINTS_NB;
    playerName: string = '';
    secondPlayerName: string | null = null;
    playerDifferencesCount: number = 0;
    secondPlayerDifferencesCount: number = 0;
    originalImageSrc: string = '';
    diffImageSrc: string = '';
    currentLevel: Level | undefined;
    videoSpeed: number = Constants.NORMAL_SPEED;
    timeFrame: number = 0;
    messageCount: number = 0;
    isStart: boolean = true;
    lastTimeFrame: {
        time: number;
        found: boolean;
        playerDifferencesCount: number;
        secondPlayerDifferencesCount: number;
        defaultCanvas: HTMLCanvasElement;
        diffCanvas: HTMLCanvasElement;
    };
    videoFrame: {
        time: number;
        found: boolean;
        playerDifferencesCount: number;
        secondPlayerDifferencesCount: number;
        defaultCanvas: HTMLCanvasElement;
        diffCanvas: HTMLCanvasElement;
    };
    messageFrame: { chatMessage: ChatMessage; time: number };

    // private popUpService: PopUpService;
    private showVideo: ReturnType<typeof setInterval>;

    /**
     * This method is called when the component is initialized.
     * It sets the game level and the game image.
     * It also handles the pausing of any audio playing if the player decides to leave the page.
     * It also connects to the the game socket and handles the response.
     */
    constructor(private popUpService: PopUpService) {}

    ngOnInit(): void {
        this.settingGameParameters();
        this.setFirstFrame();
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
        this.applyChanges(frame);
    }

    /**
     * After the undo or redo function has been called, this method will apply the changes to the canvas.
     *
     * @param canvas Takes 2 canvas, the default (left) canvas and the difference (right) canvas.
     */
    applyChanges(canvas: { defaultCanvas: HTMLCanvasElement; diffCanvas: HTMLCanvasElement } | undefined): void {
        if (!canvas) return;
        const defaultContext = this.originalPlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const diffContext = this.differencePlayArea
            .getCanvas()
            .nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        defaultContext.drawImage(canvas.defaultCanvas, 0, 0);
        diffContext.drawImage(canvas.diffCanvas, 0, 0);
    }

    /**
     * This method is called when the user clicks on the start video button.
     */
    startStopVideo(): void {
        if (this.isStart) {
            this.videoTimer.startTimer();
            if (this.timeFrame < this.lastTimeFrame.time) {
                this.playVideo();
            }
        } else {
            if (this.timeFrame < this.lastTimeFrame.time) {
                this.pauseVideo();
                this.videoTimer.stopTimer();
            }
        }
        this.isStart = !this.isStart;
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
        this.handleSpeed();
    }

    /**
     * This method is called when the user clicks on the times 2 button.
     */
    videoSpeedTime2(): void {
        this.videoSpeed = Constants.FAST_SPEED;
        this.handleSpeed();
    }

    /**
     * This method is called when the user clicks on the times 1 button.
     */
    videoSpeedTime1(): void {
        this.videoSpeed = Constants.NORMAL_SPEED;
        this.handleSpeed();
    }

    /**
     * This method is called when we have to play the video.
     */
    playVideo(): void {
        this.showVideo = setInterval(() => {
            this.handleLastFrame();
            this.handleVideoFrame();
            this.handleChat();
            this.timeFrame++;
        }, Constants.TIMER_INTERVAL / this.videoSpeed);
    }

    /**
     * This method will pause the video.
     */
    pauseVideo(): void {
        clearInterval(this.showVideo);
        this.videoTimer.stopTimer();
    }

    /**
     * This method will replay the video from the beginning.
     */
    replayVideo(): void {
        clearInterval(this.showVideo);
        VideoService.pointer = 0;
        this.timeFrame = -1;
        this.playerDifferencesCount = 0;
        this.messageCount = 0;
        this.videoTimer.resetTimer();
        this.videoChat.clearChat();
        this.isStart = true;
        this.videoFrame = VideoService.getStackElement(VideoService.pointer);
        this.messageFrame = VideoService.getMessagesStackElement(this.messageCount);
        this.videoTimer.startTimer();
        this.playVideo();
    }

    /**
     * After returning to the home page, the game stack will be reset.
     */
    returnHome(): void {
        clearInterval(this.showVideo);
        VideoService.resetStack();
        this.videoTimer.resetTimer();
        this.resetVideoAndTimer();
    }

    private handleSpeed(): void {
        this.pauseVideo();
        if (this.timeFrame < this.lastTimeFrame.time) {
            this.playVideo();
        }
    }

    /**
     * This method will handle every frame in the video stack.
     */
    private handleVideoFrame(): void {
        if (this.timeFrame >= this.videoFrame.time) {
            this.putInCanvas();
            if (this.videoFrame.found) {
                AudioService.quickPlay('./assets/audio/success.mp3', this.videoSpeed);
                this.playerDifferencesCount = this.videoFrame.playerDifferencesCount;
                this.secondPlayerDifferencesCount = this.videoFrame.secondPlayerDifferencesCount;
            }
            this.videoFrame = VideoService.getStackElement(VideoService.pointer);
        }
    }

    /**
     * This method will handle the last frame of the video.
     */
    private handleLastFrame(): void {
        if (this.timeFrame >= this.lastTimeFrame.time) {
            this.pauseVideo();
            if (VideoService.isWinning) {
                const videoDialogData: DialogData = {
                    textToSend: 'Vous avez gagné.',
                    closeButtonMessage: 'Fermé',
                    mustProcess: false,
                };
                this.popUpService.openDialog(videoDialogData);
            } else {
                const videoDialogData: DialogData = {
                    textToSend: 'Vous avez perdu.',
                    closeButtonMessage: 'Fermé',
                    mustProcess: false,
                };
                this.popUpService.openDialog(videoDialogData);
            }
        }
    }

    /**
     * This method will handle the chat stored in the message stack.
     */
    private handleChat(): void {
        if (this.timeFrame <= VideoService.messageStack[VideoService.messageStack.length - 1].time && this.timeFrame === this.messageFrame.time) {
            this.addToChat(this.messageFrame.chatMessage);
            this.messageFrame = VideoService.getMessagesStackElement(++this.messageCount);
        }
    }

    /**
     * This method will add the next text to the chat.
     *
     * @param chatMessage the next text to be added to the chat.
     */
    private addToChat(chatMessage: ChatMessage): void {
        this.videoChat.addMessage(chatMessage);
    }

    /**
     * This method will reset the video and the timer.
     */
    private resetVideoAndTimer(): void {
        clearInterval(this.showVideo);
        VideoService.pointer = 0;
        this.timeFrame = -1;
        this.playerDifferencesCount = 0;
        this.messageCount = 0;
        this.videoTimer.resetTimer();
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
        this.differencePlayArea.setContext(VideoService.getStackElement(0).diffCanvas.getContext('2d') as CanvasRenderingContext2D);
    }

    /**
     * This method will set the first frame of the video.
     */
    private setFirstFrame(): void {
        this.lastTimeFrame = VideoService.getStackElement(VideoService.getStackLength() - 1);
        this.videoFrame = VideoService.getStackElement(VideoService.pointer);
        this.messageFrame = VideoService.getMessagesStackElement(this.messageCount);
    }
}
