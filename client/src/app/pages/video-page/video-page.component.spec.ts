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
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let settingGameParametersSpy: jasmine.Spy;
    let setFirstFrameSpy: jasmine.Spy;
    let settingGameImageSpy: jasmine.Spy;

    beforeEach(async () => {
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog']);
        videoServiceSpy = jasmine.createSpyObj('VideoService', ['addToVideoStack', 'getStackElement', 'getStackLength']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        settingGameParametersSpy = spyOn(VideoPageComponent.prototype, 'settingGameParameters' as never);
        setFirstFrameSpy = spyOn(VideoPageComponent.prototype, 'setFirstFrame' as never);
        settingGameImageSpy = spyOn(VideoPageComponent.prototype, 'settingGameImage' as never);
    });

    beforeEach(async () => {
        // videoServiceSpy = jasmine.createSpyObj('VideoService', ['addToVideoStack', 'getStackElement', 'getStackLength']);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, ScaleContainerComponent, MessageBoxComponent, VideoChatComponent, VideoTimerComponent],
            imports: [MatDialogModule, AppMaterialModule],
            providers: [
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: VideoService, useValue: videoServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
            ],
        }).compileComponents();

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
        const resetStackSpy = spyOn(videoServiceSpy, 'resetStack' as never);
        component.ngOnDestroy();
        expect(resetStackSpy).toHaveBeenCalledTimes(1);
    });

    describe('putInCanvas', () => {
        it('if VideoService.pointer >= VideoService.getStackLength(), stop the interval', () => {
            VideoService.pointer = 1;
            spyOn(VideoService, 'getStackLength').and.returnValue(0);
            // const clearIntervalSpy = spyOn(window, 'clearInterval');
            const spy = spyOn(window, 'clearInterval').and.callThrough();
            component.putInCanvas();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call VideoService.getStackElement', () => {
            VideoService.pointer = 0;
            const spy = spyOn(videoServiceSpy, 'getStackLength' as never);
            component.putInCanvas();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
