import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CarouselComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('formatTime', () => {
        it('should format 00:00', () => {
            const time = 0;
            expect(component.formatTime(time)).toEqual('00:00');
        });

        it('should format 00:10', () => {
            const time = 10;
            expect(component.formatTime(time)).toEqual('00:10');
        });

        it('should format 01:00', () => {
            const time = 60;
            expect(component.formatTime(time)).toEqual('01:00');
        });

        it('should format 10:00', () => {
            const time = 600;
            expect(component.formatTime(time)).toEqual('10:00');
        });
    });

    describe('changeButtonStyle', () => {
        it('should change button style from solo to multi', () => {
            component.isSelectedButtonSolo = true;
            component.changeButtonStyle();
            expect(component.isSelectedButtonSolo).toBeFalsy();
        });

        it('should change button style from multi to solo', () => {
            component.isSelectedButtonSolo = false;
            component.changeButtonStyle();
            expect(component.isSelectedButtonSolo).toBeTruthy();
        });
    });
});
