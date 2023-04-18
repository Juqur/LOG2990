import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleContainerComponent } from './scale-container.component';

describe('ScaleContainerComponent', () => {
    let component: ScaleContainerComponent;
    let fixture: ComponentFixture<ScaleContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScaleContainerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ScaleContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('resizeContainer should be called on init', () => {
        const spy = spyOn(component, 'resizeContainer');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('resizeContainer should calculate the scale correctly', () => {
        const expectScale = 0.4;
        component['screen'] = {
            nativeElement: {
                offsetWidth: 768,
                offsetHeight: 926,
            },
        } as ElementRef;
        component['container'] = {
            nativeElement: {
                offsetWidth: 1920,
                offsetHeight: 1080,
            },
        } as ElementRef;

        component.resizeContainer();
        expect(component.scale).toEqual(expectScale);
    });
});
