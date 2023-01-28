import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

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
        component.gameLength = 600;
        component.ngOnInit();
        expect(component.gameTimeFormatted).toEqual('Time: 10:00');
        tick(481000);
        expect(component.gameTimeFormatted).toEqual('Time: 01:59');
        tick(29000);
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 01:00');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 00:30');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        discardPeriodicTasks();
    }));

    it('Up timer should correctly increment value.', fakeAsync(() => {
        component.isCountDown = false;
        component.gameLength = 600;
        component.ngOnInit();
        tick(1000);
        expect(component.gameTimeFormatted).toEqual('Time: 00:01');
        tick(29000);
        expect(component.gameTimeFormatted).toEqual('Time: 00:30');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 01:00');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 01:30');
        tick(30000);
        expect(component.gameTimeFormatted).toEqual('Time: 02:00');
        tick(480000);
        expect(component.gameTimeFormatted).toEqual('Time: 10:00');
        discardPeriodicTasks();
    }));

    it('Down timer should stop decrementing after max value', fakeAsync(() => {
        component.isCountDown = true;
        component.gameLength = 120;
        component.ngOnInit();
        tick(121000);
        expect(component.gameTimeFormatted).toEqual('Time: 00:00');
        discardPeriodicTasks();
    }));

    it('Up timer should stop incrementing after max value', fakeAsync(() => {
        component.isCountDown = false;
        component.gameLength = 120;
        component.ngOnInit();
        tick(121000);
        expect(component.gameTimeFormatted).toEqual('Time: 02:00');
        discardPeriodicTasks();
    }));
});
