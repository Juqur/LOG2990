import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [MainPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should handle volume icon when calling volumeOnClick', () => {
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_up');
    });
    it('should handle volume icon when calling volumeOnClick twice', () => {
        component.volumeOnClick();
        component.volumeOnClick();
        expect(component.icon).toEqual('volume_off');
    });
    it('should handle credits display when calling creditsOnClick', () => {
        const credits = document.getElementById('credits');
        if (!credits) {
            return;
        }
        component.creditsOnClick();
        expect(credits.style.display).toEqual('block');
    });
    it('should redirect to /game when clicking on the classic button', () => {
        const router = TestBed.inject(Router);
        const spy = spyOn(router, 'navigate');
        component.startGameOnClick();
        expect(spy).toHaveBeenCalledWith(['/game']);
    });
});
