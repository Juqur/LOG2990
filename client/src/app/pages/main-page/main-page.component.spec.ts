import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should handle volume icon when calling volumeOnClick', () => {
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
        const navigateSpy = spyOn(router, 'navigate');
        const button = document.getElementsByClassName('menu-button')[0];
        button.dispatchEvent(new Event('click'));
        expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });
});
