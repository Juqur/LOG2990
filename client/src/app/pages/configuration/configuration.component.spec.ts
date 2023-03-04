import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { CarouselComponent } from '@app/components/carousel/carousel.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { LevelService } from '@app/services/levelService/level.service';
import { ConfigurationComponent } from './configuration.component';

describe('ConfigurationComponent', () => {
    let component: ConfigurationComponent;
    let fixture: ComponentFixture<ConfigurationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigurationComponent, CarouselComponent, CardComponent, ScaleContainerComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, HttpClientTestingModule],
            providers: [LevelService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
