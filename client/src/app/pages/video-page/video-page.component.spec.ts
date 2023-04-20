/* eslint-disable max-lines */
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { VideoChatComponent } from '@app/components/video-chat/video-chat.component';
import { VideoTimerComponent } from '@app/components/video-timer/video-timer.component';
import { AudioService } from '@app/services/audio/audio.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';

import { AppModule } from '@app/app.module';
import { TimerService } from '@app/services/timer/timer.service';
import { VideoPageComponent } from './video-page.component';

describe('VideoPageComponent', () => {
    let component: VideoPageComponent;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let fixture: ComponentFixture<VideoPageComponent>;
    let videoServiceSpy: jasmine.SpyObj<VideoService>;
    let videoTimerComponentSpy: jasmine.SpyObj<VideoTimerComponent>;
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let settingGameParametersSpy: jasmine.Spy;
    let setFirstFrameSpy: jasmine.Spy;
    let settingGameImageSpy: jasmine.Spy;
    let drawImageSpy: jasmine.Spy;
    let timerServiceSpy: jasmine.SpyObj<TimerService>;
    const canvas = document.createElement('canvas');
    const nativeElementMock = { nativeElement: canvas };

    beforeEach(async () => {
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog']);
        videoServiceSpy = jasmine.createSpyObj('VideoService', [
            'addToVideoStack',
            'getStackElement',
            'getStackLength',
            'resetStack',
            'getFirstPlayerName',
            'getSecondPlayerName',
        ]);
        videoTimerComponentSpy = jasmine.createSpyObj('VideoTimerComponent', ['startTimer', 'stopTimer']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        settingGameParametersSpy = spyOn(VideoPageComponent.prototype, 'settingGameParameters' as never);
        setFirstFrameSpy = spyOn(VideoPageComponent.prototype, 'setFirstFrame' as never);
        settingGameImageSpy = spyOn(VideoPageComponent.prototype, 'settingGameImage' as never);
        drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
        timerServiceSpy = jasmine.createSpyObj('TimerService', ['startTimer', 'stopTimer']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, ScaleContainerComponent, MessageBoxComponent, VideoChatComponent, VideoTimerComponent],
            imports: [AppModule],
            providers: [
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: VideoService, useValue: videoServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: VideoTimerComponent, useValue: videoTimerComponentSpy },
            ],
        })
            .overrideProvider(TimerService, { useValue: timerServiceSpy })
            .compileComponents();

        playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);

        fixture = TestBed.createComponent(VideoPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call settingGameParameters', () => {
        settingGameParametersSpy.calls.reset();
        setFirstFrameSpy.calls.reset();
        component.ngOnInit();
        expect(settingGameParametersSpy).toHaveBeenCalledTimes(1);
        expect(setFirstFrameSpy).toHaveBeenCalledTimes(1);
    });

    it('ngAfterViewInit should call settingGameImage', () => {
        settingGameImageSpy.calls.reset();
        component.ngAfterViewInit();
        expect(settingGameImageSpy).toHaveBeenCalledTimes(1);
    });

    it('ngOnDestroy should call VideoService.resetStack', () => {
        const resetStackSpy = spyOn(VideoService, 'resetStack' as never);
        component.ngOnDestroy();
        expect(resetStackSpy).toHaveBeenCalledTimes(1);
    });

    describe('putInCanvas', () => {
        it('if VideoService.pointer >= VideoService.getStackLength(), stop the interval', () => {
            VideoService.pointer = 1;
            const spy = spyOn(window, 'clearInterval').and.callThrough();
            component.putInCanvas();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call VideoService.getStackElement and applyChanges', () => {
            VideoService.pointer = 0;
            const spy = spyOn(VideoService, 'getStackLength' as never);
            const applyChangesSpy = spyOn(component, 'applyChanges' as never);
            component.putInCanvas();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(applyChangesSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('applyChanges', () => {
        const inputCanvases = { defaultCanvas: {} as unknown as HTMLCanvasElement, diffCanvas: {} as unknown as HTMLCanvasElement };

        it('should call drawImage', () => {
            component['originalPlayArea'] = playAreaComponentSpy;
            component['differencePlayArea'] = playAreaComponentSpy;
            // playAreaComponentSpy.getCanvas.and.returnValue(document.createElement('canvas'));
            component.applyChanges(inputCanvases);
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe('startStopVideo', () => {
        beforeEach(() => {
            spyOn(component, 'pauseVideo' as never);
            spyOn(component, 'playVideo' as never);
        });

        it('if isStart is true, should call startTimer', () => {
            component.isStart = true;
            component['videoTimer'] = videoTimerComponentSpy;
            component['lastTimeFrame'] = {
                time: 1,
                found: true,
                playerDifferencesCount: 2,
                secondPlayerDifferencesCount: 1,
                defaultCanvas: document.createElement('canvas'),
                diffCanvas: document.createElement('canvas'),
            };
            component.startStopVideo();
            expect(videoTimerComponentSpy.startTimer).toHaveBeenCalledTimes(1);
        });

        it('if isStart is false, should call pauseVideo and stopTimer', () => {
            component['timeFrame'] = 0;
            component['lastTimeFrame'] = {
                time: 1,
                found: true,
                playerDifferencesCount: 2,
                secondPlayerDifferencesCount: 1,
                defaultCanvas: document.createElement('canvas'),
                diffCanvas: document.createElement('canvas'),
            };
            component.isStart = false;
            component['videoTimer'] = videoTimerComponentSpy;
            component.startStopVideo();
            expect(videoTimerComponentSpy.stopTimer).toHaveBeenCalledTimes(1);
        });
    });

    it('getFirstPlayerName should return firstPlayerName', () => {
        spyOn(VideoService, 'getFirstPlayerName').and.returnValue('firstPlayerName');
        const result = component.getFirstPlayerName();
        expect(result).toEqual('firstPlayerName');
    });

    it('getSecondPlayerName should return secondPlayerName', () => {
        spyOn(VideoService, 'getSecondPlayerName').and.returnValue('secondPlayerName');
        const result = component.getSecondPlayerName();
        expect(result).toEqual('secondPlayerName');
    });

    it('videoSpeedTime4 should change the play speed to 4', () => {
        const spy = spyOn(component, 'handleSpeed' as never);
        component.videoSpeedTime4();
        expect(component['videoSpeed']).toEqual(Constants.VERY_FAST_SPEED);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('videoSpeedTime2 should change the play speed to 2', () => {
        const spy = spyOn(component, 'handleSpeed' as never);
        component.videoSpeedTime2();
        expect(component['videoSpeed']).toEqual(Constants.FAST_SPEED);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('videoSpeedTime1 should change the play speed to 1', () => {
        const spy = spyOn(component, 'handleSpeed' as never);
        component.videoSpeedTime1();
        expect(component['videoSpeed']).toEqual(Constants.NORMAL_SPEED);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('playVideo should handle frames', fakeAsync(() => {
        const handleLastFrameSpy = spyOn(component, 'handleLastFrame' as never);
        const handleVideoFrameSpy = spyOn(component, 'handleVideoFrame' as never);
        const handleChatSpy = spyOn(component, 'handleChat' as never);
        component.playVideo();
        tick(Constants.TIMER_INTERVAL);
        expect(handleLastFrameSpy).toHaveBeenCalled();
        expect(handleVideoFrameSpy).toHaveBeenCalled();
        expect(handleChatSpy).toHaveBeenCalled();
        clearInterval(component['showVideo']);
    }));

    it('pauseVideo should clear the interval', () => {
        const spy = spyOn(window, 'clearInterval').and.callThrough();
        // const stopTimerSpy = spyOn(component['videoTimer'], 'stopTimer');
        component['videoTimer'] = videoTimerComponentSpy;
        component.pauseVideo();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(videoTimerComponentSpy.stopTimer).toHaveBeenCalledTimes(1);
    });

    it('replayVideo', fakeAsync(() => {
        const spy = spyOn(window, 'clearInterval').and.callThrough();
        const resetTimerSpy = spyOn(component['videoTimer'], 'resetTimer' as never);
        // const resetChatSpy = spyOn(component['videoChat'], 'resetChat' as never);
        VideoService['videoStack'] = [
            {
                time: 1,
                found: false,
                playerDifferencesCount: 1,
                secondPlayerDifferencesCount: 1,
                defaultCanvas: document.createElement('canvas'),
                diffCanvas: document.createElement('canvas'),
            },
        ];
        VideoService['messageStack'] = [
            {
                chatMessage: {
                    sender: 'string',
                    senderId: 'string',
                    text: 'string',
                },
                time: 1,
            },
        ];
        const startTimerSpy = spyOn(component['videoTimer'], 'startTimer' as never);
        const playVideoSpy = spyOn(component, 'playVideo' as never);
        const getStackElementSpy = spyOn(VideoService, 'getStackElement' as never);
        const getMessagesStackElementSpy = spyOn(VideoService, 'getMessagesStackElement' as never);
        component.replayVideo();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(resetTimerSpy).toHaveBeenCalledTimes(1);
        // expect(resetChatSpy).toHaveBeenCalledTimes(1);
        expect(startTimerSpy).toHaveBeenCalledTimes(1);
        expect(playVideoSpy).toHaveBeenCalledTimes(1);
        expect(getStackElementSpy).toHaveBeenCalledTimes(1);
        expect(getMessagesStackElementSpy).toHaveBeenCalledTimes(1);
    }));

    it('returnHome', () => {
        // const spy = spyOn(component['router'], 'navigate');
        const spy = spyOn(window, 'clearInterval').and.callThrough();
        const resetTimerSpy = spyOn(component['videoTimer'], 'resetTimer' as never);
        const resetVideoAndTimerSpy = spyOn(component, 'resetVideoAndTimer' as never);
        const resetStackSpy = spyOn(VideoService, 'resetStack' as never);
        component.returnHome();
        // expect(spy).toHaveBeenCalledWith(['']);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(resetStackSpy).toHaveBeenCalledTimes(1);
        expect(resetTimerSpy).toHaveBeenCalledTimes(1);
        expect(resetVideoAndTimerSpy).toHaveBeenCalledTimes(1);
    });

    it('handleSpeed', () => {
        component['timeFrame'] = 0;

        component['lastTimeFrame'] = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        const pauseVideoSpy = spyOn(component, 'pauseVideo' as never);
        // const playVideoSpy = spyOn(component, 'playVideo' as never);
        spyOn(component, 'playVideo' as never);
        component['handleSpeed']();
        expect(pauseVideoSpy).toHaveBeenCalledTimes(1);
        expect(component.playVideo).toHaveBeenCalledTimes(1);
    });

    it('handleVideoFrame', () => {
        component.timeFrame = 10;
        component.videoFrame = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        const putInCanvasSpy = spyOn(component, 'putInCanvas' as never);
        const quickPlaySpy = spyOn(AudioService, 'quickPlay' as never);
        component['handleVideoFrame']();

        expect(putInCanvasSpy).toHaveBeenCalledTimes(1);
        expect(quickPlaySpy).toHaveBeenCalledTimes(1);
    });

    it('handleLastFrame if is winning', () => {
        component.timeFrame = 10;
        component.lastTimeFrame = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        VideoService.isWinning = true;
        const pauseVideoSpy = spyOn(component, 'pauseVideo' as never);
        component['handleLastFrame']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        expect(pauseVideoSpy).toHaveBeenCalledTimes(1);
    });

    it('handleLastFrame if is not winning', () => {
        component.timeFrame = 10;
        component.lastTimeFrame = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        VideoService.isWinning = false;
        const pauseVideoSpy = spyOn(component, 'pauseVideo' as never);
        component['handleLastFrame']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        expect(pauseVideoSpy).toHaveBeenCalledTimes(1);
    });

    it('handleChat', () => {
        component.timeFrame = 10;
        VideoService.messageStack = [
            {
                chatMessage: {
                    sender: 'string',
                    senderId: 'string',
                    text: 'string',
                },
                time: 100,
            },
        ];
        component.messageFrame = {
            chatMessage: {
                sender: 'string',
                senderId: 'string',
                text: 'string',
            },
            time: 10,
        };

        const addToChatSpy = spyOn(component, 'addToChat' as never);
        component['handleChat']();
        expect(addToChatSpy).toHaveBeenCalledTimes(1);
    });

    it('addToChat', () => {
        const spy = spyOn(component['videoChat'], 'addMessage' as never);
        component['addToChat']({ sender: 'string', senderId: 'string', text: 'string' });
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('resetVideoAndTimer', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        const resetTimerSpy = spyOn(component['videoTimer'], 'resetTimer' as never);
        component['resetVideoAndTimer']();
        expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
        expect(resetTimerSpy).toHaveBeenCalledTimes(1);
    });

    it('settingGameParameters', () => {
        VideoService.firstPlayerName = 'first name';
        VideoService.secondPlayerName = 'second name';
        component['settingGameParameters']();
        expect(VideoService.firstPlayerName).toEqual('first name');
        expect(VideoService.secondPlayerName).toEqual('second name');
    });

    it('settingGameImage', () => {
        component['settingGameImage']();
    });

    it('setFirstFrame', () => {
        VideoService['videoStack'] = [
            {
                time: 1,
                found: true,
                playerDifferencesCount: 2,
                secondPlayerDifferencesCount: 1,
                defaultCanvas: document.createElement('canvas'),
                diffCanvas: document.createElement('canvas'),
            },
        ];
        VideoService['pointer'] = 0;
        VideoService['messageStack'] = [
            {
                chatMessage: {
                    sender: 'string',
                    senderId: 'string',
                    text: 'string',
                },
                time: 100,
            },
        ];
        component.lastTimeFrame = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        component.videoFrame = {
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        };
        component.messageFrame = {
            chatMessage: {
                sender: 'string',
                senderId: 'string',
                text: 'string',
            },
            time: 100,
        };

        component['setFirstFrame']();
        expect(component.lastTimeFrame).toEqual({
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        });
        expect(component.videoFrame).toEqual({
            time: 1,
            found: true,
            playerDifferencesCount: 2,
            secondPlayerDifferencesCount: 1,
            defaultCanvas: document.createElement('canvas'),
            diffCanvas: document.createElement('canvas'),
        });
        expect(component.messageFrame).toEqual({
            chatMessage: {
                sender: 'string',
                senderId: 'string',
                text: 'string',
            },
            time: 100,
        });
    });
});
