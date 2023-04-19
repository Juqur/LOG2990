import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { VideoChatComponent } from '@app/components/video-chat/video-chat.component';
import { VideoTimerComponent } from '@app/components/video-timer/video-timer.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { PopUpService } from '@app/services/pop-up/pop-up.service';

import { VideoPageComponent } from './video-page.component';

describe('VideoPageComponent', () => {
    let component: VideoPageComponent;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let fixture: ComponentFixture<VideoPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, ScaleContainerComponent, MessageBoxComponent, VideoChatComponent, VideoTimerComponent],
            providers: [AppMaterialModule, { provide: PopUpService, useValue: popUpServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
