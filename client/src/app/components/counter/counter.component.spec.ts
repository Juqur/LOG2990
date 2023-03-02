import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MouseService } from '@app/services/mouse.service';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { CounterComponent } from './counter.component';
import SpyObj = jasmine.SpyObj;

describe('CounterComponent', () => {
    let component: CounterComponent;
    let fixture: ComponentFixture<CounterComponent>;
    let mouseServiceMock: SpyObj<MouseService>;

    beforeEach(async () => {
        mouseServiceMock = jasmine.createSpyObj('MouseService', ['getDifferenceCounter']);

        await TestBed.configureTestingModule({
            imports: [HttpClientModule, AppMaterialModule, RouterTestingModule],
            declarations: [CounterComponent],
            providers: [{ provide: MouseService, useValue: mouseServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
