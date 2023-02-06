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

    it('should format time', () => {
        const time = 60;
        expect(component.formatTime(time)).toEqual('01:00');
    });

    it('should change button style from solo to multi', () => {
        component.selectedButton = 'solo';
        component.changeButtonStyle('multi');
        expect(component.selectedButton).toEqual('multi');
    });

    it('should change button style from multi to solo', () => {
        component.selectedButton = 'multi';
        component.changeButtonStyle('solo');
        expect(component.selectedButton).toEqual('solo');
    });
});
