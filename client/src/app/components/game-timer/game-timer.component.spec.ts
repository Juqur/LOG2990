import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let fixture: ComponentFixture<GameTimerComponent>;
    let socketHandler: jasmine.SpyObj<SocketHandler>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
            providers: [SocketHandler],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTimerComponent);
        socketHandler = TestBed.inject(SocketHandler) as jasmine.SpyObj<SocketHandler>;
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
