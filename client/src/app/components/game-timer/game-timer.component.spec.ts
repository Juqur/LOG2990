import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { TestConstants } from '@common/test-constants';
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

    it('should format time', () => {
        component.updateTimer(TestConstants.ninetySecondsTimer);
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');

        component.updateTimer(TestConstants.tenSecondsTimer);
        expect(component.gameTimeFormatted).toEqual('Time: 00:10');

        component.updateTimer(TestConstants.OneHourTimer);
        expect(component.gameTimeFormatted).toEqual('Time: 60:00');
    });

    it('should listen to the "sendTime" event on init', () => {
        expect(socketHandlerMock.on).toHaveBeenCalledWith('game', 'sendTime', jasmine.any(Function));
    });

    it('should update the timer when receiving "sendTime" event', () => {
        const data = 0;
        const spy = spyOn(component, 'updateTimer');
        socketHandlerMock.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'sendTime') {
                callback(data);
            }
        });
        component.ngOnInit();
        expect(spy).toHaveBeenCalledWith(data);
    });
});
