import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Constants } from '@common/constants';
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
        let time = 0;
        expect(component.formatTime(time)).toEqual('00:00');
        time = Constants.thirty;
        expect(component.formatTime(time)).toEqual('00:30');
        time = Constants.sixty;
        expect(component.formatTime(time)).toEqual('01:00');
        time = Constants.thirty + Constants.sixty;
        expect(component.formatTime(time)).toEqual('01:30');
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
