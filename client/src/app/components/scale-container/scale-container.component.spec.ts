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
});
