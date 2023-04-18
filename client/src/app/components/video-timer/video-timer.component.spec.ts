import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTimerComponent } from './video-timer.component';

describe('VideoTimerComponent', () => {
  let component: VideoTimerComponent;
  let fixture: ComponentFixture<VideoTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoTimerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
