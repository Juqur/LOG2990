import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilityService } from '@app/services/utility/utility.service';
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
        it('should call formatTime', () => {
            const expectedTime = 69;
            const formatTimeSpy = spyOn(UtilityService, 'formatTime');
            component.formatTime(expectedTime);
            expect(formatTimeSpy).toHaveBeenCalledWith(expectedTime);
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
