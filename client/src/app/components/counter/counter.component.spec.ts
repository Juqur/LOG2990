import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMaterialModule } from '@app/modules/material.module';

import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
    let component: CounterComponent;
    let fixture: ComponentFixture<CounterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, AppMaterialModule, RouterTestingModule],
            declarations: [CounterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
