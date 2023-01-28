import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
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

    it('Down timer should have a value after initialization.', fakeAsync(() => {
        component.isCountDown = true;
        component.gameLength = 120;
        component.ngOnInit();
        expect(component.gameTimeFormatted).toEqual('Time: 02:00');
        discardPeriodicTasks();
    }));

    it('Up timer should have a value after initialization.', fakeAsync(() => {
        component.isCountDown = false;
        component.gameLength = 120;
        component.ngOnInit();
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        discardPeriodicTasks();
    }));

    it('Down timer should correctly decrement value.', fakeAsync(() => {
        component.isCountDown = true;
        component.gameLength = 120;
        component.ngOnInit();
        tick(Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 01:59');
        tick((Constants.thirty - 1) * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 01:00');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 00:30');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        discardPeriodicTasks();
    }));

    it('Up timer should correctly increment value.', fakeAsync(() => {
        component.isCountDown = false;
        component.gameLength = 120;
        component.ngOnInit();
        tick(Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 00:01');
        tick((Constants.thirty - 1) * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 00:30');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 01:00');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');
        tick(Constants.thirty * Constants.millisecondsInOneSecond);
        expect(component.gameTimeFormatted).toEqual('Time: 02:00');
        discardPeriodicTasks();
    }));

    it('Down timer should stop decrementing after max value', fakeAsync(() => {
        component.isCountDown = true;
        component.gameLength = 120;
        component.ngOnInit();
        tick(
            Constants.hundred * Constants.millisecondsInOneSecond +
                Constants.twenty * Constants.millisecondsInOneSecond +
                Constants.millisecondsInOneSecond,
        );
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        discardPeriodicTasks();
    }));

    it('Up timer should stop incrementing after max value', fakeAsync(() => {
        component.isCountDown = false;
        component.gameLength = 120;
        component.ngOnInit();
        tick(
            Constants.hundred * Constants.millisecondsInOneSecond +
                Constants.twenty * Constants.millisecondsInOneSecond +
                Constants.millisecondsInOneSecond,
        );
        expect(component.gameTimeFormatted).toEqual('Time: 02:00');
        discardPeriodicTasks();
    }));
});
