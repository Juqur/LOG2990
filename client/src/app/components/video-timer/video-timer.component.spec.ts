import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Constants } from '@common/constants';

import { VideoTimerComponent } from './video-timer.component';

describe('VideoTimerComponent', () => {
    let component: VideoTimerComponent;
    let fixture: ComponentFixture<VideoTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoTimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('startTimer should increment Timer.time', fakeAsync(() => {
        const updateTimerSpy = spyOn(component, 'updateTimer' as never);
        component.startTimer();
        tick(Constants.millisecondsInOneSecond);
        expect(component.time).toBeGreaterThan(0);
        expect(updateTimerSpy).toHaveBeenCalledTimes(1);
        clearInterval(component['interval']);
    }));

    it('stopTimer should stop the timer', () => {
        const updateTimerSpy = spyOn(component, 'updateTimer' as never);
        component.startTimer();
        component.stopTimer();
        expect(updateTimerSpy).toHaveBeenCalledTimes(0);
    });

    it('resetTimer should reset the timer', () => {
        const stopTimerSpy = spyOn(component, 'stopTimer' as never);
        const updateTimerSpy = spyOn(component, 'updateTimer' as never);
        component.startTimer();
        component.resetTimer();
        expect(stopTimerSpy).toHaveBeenCalledTimes(1);
        expect(updateTimerSpy).toHaveBeenCalledTimes(1);
        expect(component.time).toEqual(0);
    });

    it('should format the time correctly when time is under 10 minute', () => {
        const time = 70; // 1 minute and 10 seconds
        component.updateTimer(time);
        expect(component.gameTimeFormatted).toBe('Temps: 01:10');
    });

    it('should format the time correctly when time is above 10 minute', () => {
        const time = 610; // 10 minute and 10 seconds
        component.updateTimer(time);
        expect(component.gameTimeFormatted).toBe('Temps: 10:10');
    });
});
