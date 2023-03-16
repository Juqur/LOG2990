import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { GameTimerComponent } from './game-timer.component';

describe('GameTimerComponent', () => {
    let component: GameTimerComponent;
    let fixture: ComponentFixture<GameTimerComponent>;
    const socketHandlerSpy = {
        on: jasmine.createSpy(),
        removeListener: jasmine.createSpy(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameTimerComponent],
            providers: [{ provide: SocketHandler, useValue: socketHandlerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameTimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call updateTimer', () => {
            const spy = spyOn(component, 'updateTimer');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });

        it('should listen to the "sendTime" event on init', () => {
            expect(socketHandlerSpy.on).toHaveBeenCalledWith('game', 'sendTime', jasmine.any(Function));
        });

        it('should update the timer when receiving "sendTime" event', () => {
            const data = 0;
            const spy = spyOn(component, 'updateTimer');
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'sendTime') {
                    callback(data);
                }
            });
            component.ngOnInit();
            expect(spy).toHaveBeenCalledWith(data);
        });
    });

    describe('updateTimer', () => {
        it('should format 00:00', () => {
            const time = 0;
            component.updateTimer(time);
            expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        });

        it('should format 00:10', () => {
            const time = 10;
            component.updateTimer(time);
            expect(component.gameTimeFormatted).toEqual('Time: 00:10');
        });

        it('should format 01:00', () => {
            const time = 60;
            component.updateTimer(time);
            expect(component.gameTimeFormatted).toEqual('Time: 01:00');
        });

        it('should format 10:00', () => {
            const time = 600;
            component.updateTimer(time);
            expect(component.gameTimeFormatted).toEqual('Time: 10:00');
        });
    });

    describe('ngOnDestroy', () => {
        it('should remove the "sendTime" event listener', () => {
            component.ngOnDestroy();
            expect(socketHandlerSpy.removeListener).toHaveBeenCalledWith('sendTime');
        });
    });
});
