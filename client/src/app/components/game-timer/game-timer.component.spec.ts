import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { UtilityService } from '@app/services/utility/utility.service';
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
        it('should call formatTime', () => {
            const expectedTime = 69;
            const formatTimeSpy = spyOn(UtilityService, 'formatTime');
            component.updateTimer(expectedTime);
            expect(formatTimeSpy).toHaveBeenCalledWith(expectedTime);
        });

        it('should return the appropriate format', () => {
            const time = 0;
            const expectedFormat = 'Temps: 00:00';
            spyOn(UtilityService, 'formatTime').and.returnValue('00:00');
            component.updateTimer(time);
            expect(component.currentTime).toEqual(expectedFormat);
        });
    });

    describe('ngOnDestroy', () => {
        it('should remove the "sendTime" event listener', () => {
            component.ngOnDestroy();
            expect(socketHandlerSpy.removeListener).toHaveBeenCalledWith('game', 'sendTime');
        });
    });
});
