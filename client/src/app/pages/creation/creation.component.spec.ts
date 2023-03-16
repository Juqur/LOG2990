/* eslint-disable max-lines */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CreationPageService } from '@app/services/creationPageService/creation-page.service';
import { CreationComponent } from './creation.component';

describe('CreationComponent', () => {
    let component: CreationComponent;
    let fixture: ComponentFixture<CreationComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationComponent, ScaleContainerComponent, PlayAreaComponent],
            providers: [CreationPageService, HttpClient, HttpHandler],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        }).compileComponents();
        fixture = TestBed.createComponent(CreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
