import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AudioService } from '@app/services/audio/audio.service';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    const mockScaleContainer: SpyObj<ScaleContainerComponent> = jasmine.createSpyObj('ScaleContainerComponent', ['ngOnInit', 'resizeContainer']);
    let ngOnInitSpy: jasmine.Spy<() => void>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MainPageComponent, ScaleContainerComponent],
            imports: [RouterTestingModule],
            providers: [{ provide: ScaleContainerComponent, useValue: mockScaleContainer }],
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

    it('should redirect to /selection when clicking on the classic button', () => {
        const router = TestBed.inject(Router);
        const spy = spyOn(router, 'navigate');
        component.classicPageOnClick();
        expect(spy).toHaveBeenCalledWith(['/selection']);
    });

    it('should redirect to /config when clicking on the classic button', () => {
        const router = TestBed.inject(Router);
        const spy = spyOn(router, 'navigate');
        component.configPageOnClick();
        expect(spy).toHaveBeenCalledWith(['/config']);
    });
});
