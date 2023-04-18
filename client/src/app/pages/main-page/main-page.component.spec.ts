import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AudioService } from '@app/services/audio/audio.service';
import { MainPageService } from '@app/services/main-page/main-page.service';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    const mockScaleContainer: SpyObj<ScaleContainerComponent> = jasmine.createSpyObj('ScaleContainerComponent', ['ngOnInit', 'resizeContainer']);
    let ngOnInitSpy: jasmine.Spy<() => void>;
    let mainPageServiceSpy: jasmine.SpyObj<MainPageService>;

    beforeEach(waitForAsync(() => {
        mainPageServiceSpy = jasmine.createSpyObj('MainPageService', ['navigateTo', 'chooseName', 'connectToSocket']);
        TestBed.configureTestingModule({
            declarations: [MainPageComponent, ScaleContainerComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: ScaleContainerComponent, useValue: mockScaleContainer },
                { provide: MainPageService, useValue: mainPageServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        ngOnInitSpy = spyOn(component, 'ngOnInit');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should make the appropriate calls to audio service.', () => {
        const createSpy = spyOn(AudioService.prototype, 'create');
        const loopSpy = spyOn(AudioService.prototype, 'loop');
        const muteSpy = spyOn(AudioService.prototype, 'mute');
        const playSpy = spyOn(AudioService.prototype, 'play');
        ngOnInitSpy.and.callThrough();

        component.ngOnInit();

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(loopSpy).toHaveBeenCalledTimes(1);
        expect(muteSpy).toHaveBeenCalledTimes(1);
        expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle volume icon when calling volumeOnClick', () => {
        spyOn(AudioService, 'quickPlay');
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_up');
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_off');
    });

    it('creditsOnClick should handle credits display', () => {
        spyOn(AudioService, 'quickPlay');
        expect(component.showCredits).toBeTruthy();
        component.creditsOnClick();
        expect(component.showCredits).toBeFalsy();
        component.creditsOnClick();
        expect(component.showCredits).toBeTruthy();
    });

    it('should redirect to the correct page when button is clicked', () => {
        component.navigateTo('/selection');
        expect(mainPageServiceSpy.navigateTo).toHaveBeenCalledWith('/selection');
    });

    it('should ask the player to choose a name when clicking on the timed button', () => {
        component.onLimitedTimeClick();
        expect(mainPageServiceSpy.chooseName).toHaveBeenCalled();
    });
});
