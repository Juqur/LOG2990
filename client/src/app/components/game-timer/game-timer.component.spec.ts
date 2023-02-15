import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let fixture: ComponentFixture<GameTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
            providers: [SocketHandler],
            imports: [RouterTestingModule],
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

    it('should set timer and format time', () => {
        component.setTimer(1);
        expect(component.gameTime).toEqual(1);
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 00:01');
    });
});
