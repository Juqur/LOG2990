import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let fixture: ComponentFixture<GameTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set timer', () => {
        component.setTimer(1);
        expect(component.gameTime).toEqual(1);
    });

    it('should format time', () => {
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        component.gameTime = Constants.sixty;
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 01:00');
    });
});
