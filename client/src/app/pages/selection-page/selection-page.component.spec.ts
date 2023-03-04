import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
            imports: [AppMaterialModule, HttpClientTestingModule],
            providers: [LevelService],
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
});
