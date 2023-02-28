import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AudioService } from '@app/services/audioService/audio.service';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [MainPageComponent, ScaleContainerComponent],
            imports: [RouterTestingModule],
            providers: [AudioService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should handle volume icon when calling volumeOnClick', () => {
        spyOn(component['audioService'], 'playSound');
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_up');
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_off');
    });

    it('creditsOnClick should handle credits display', () => {
        spyOn(component['audioService'], 'playSound');
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
