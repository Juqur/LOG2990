import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/levelService/level.service';
import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent, CarouselComponent, CardComponent, ScaleContainerComponent],
            imports: [AppMaterialModule, RouterTestingModule, HttpClientTestingModule],
            providers: [LevelService, UrlSerializer],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup socket', () => {
        const setupSocketSpy = spyOn(component['selectionPageService'], 'setupSocket');
        component.ngOnInit();
        expect(setupSocketSpy).toHaveBeenCalled();
    });
});
