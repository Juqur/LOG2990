import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    const socketHandlerMock = {
        on: jasmine.createSpy(),
    };
    let fixture: ComponentFixture<GameTimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
            providers: [{ provide: SocketHandler, useValue: socketHandlerMock }],
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

    it('should set the timer to 0 on init', () => {
        expect(component.gameTime).toBe(0);
    });

    it('should set timer', () => {
        component.setTimer(1);
        expect(component.gameTime).toEqual(1);
    });

    it('should format time', () => {
        component.gameTime = 90;
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');

        component.gameTime = 10;
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 00:10');

        component.gameTime = 3600;
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 60:00');
    });

    it('should set timer and format time', () => {
        component.setTimer(1);
        expect(component.gameTime).toEqual(1);
        component.formatTime();
        expect(component.gameTimeFormatted).toEqual('Time: 00:01');
    });

    it('should listen to the "sendTime" event on init', () => {
        expect(socketHandlerMock.on).toHaveBeenCalledWith('game', 'sendTime', jasmine.any(Function));
    });

    it('should update the timer when receiving "sendTime" event', () => {
        const data = 0;
        const spy = spyOn(component, 'setTimer');
        socketHandlerMock.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'sendTime') {
                callback(data);
            }
        });
        component.ngOnInit();
        expect(spy).toHaveBeenCalledWith(data);
    });
});
