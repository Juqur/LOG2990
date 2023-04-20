import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { VideoChatComponent } from '@app/components/video-chat/video-chat.component';
import { VideoTimerComponent } from '@app/components/video-timer/video-timer.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { VideoService } from '@app/services/video/video.service';

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
    const canvas = document.createElement('canvas');
    const nativeElementMock = { nativeElement: canvas };

    beforeEach(async () => {
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog']);
        videoServiceSpy = jasmine.createSpyObj('VideoService', ['addToVideoStack', 'getStackElement', 'getStackLength', 'resetStack']);
        videoTimerComponentSpy = jasmine.createSpyObj('VideoTimerComponent', ['startTimer', 'stopTimer']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        settingGameParametersSpy = spyOn(VideoPageComponent.prototype, 'settingGameParameters' as never);
        setFirstFrameSpy = spyOn(VideoPageComponent.prototype, 'setFirstFrame' as never);
        settingGameImageSpy = spyOn(VideoPageComponent.prototype, 'settingGameImage' as never);
        drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage');
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, ScaleContainerComponent, MessageBoxComponent, VideoChatComponent, VideoTimerComponent],
            imports: [MatDialogModule, AppMaterialModule],
            providers: [
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: VideoService, useValue: videoServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: VideoTimerComponent, useValue: videoTimerComponentSpy },
            ],
        }).compileComponents();

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
    });
});
