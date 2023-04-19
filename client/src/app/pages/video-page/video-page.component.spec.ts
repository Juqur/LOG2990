import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';

import { VideoPageComponent } from './video-page.component';

describe('VideoPageComponent', () => {
    let component: VideoPageComponent;
    let fixture: ComponentFixture<VideoPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoPageComponent, MessageBoxComponent, MatIcon],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
