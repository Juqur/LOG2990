import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistoriesPageComponent } from './game-histories-page.component';

describe('GameHistoriesPageComponent', () => {
    let component: GameHistoriesPageComponent;
    let fixture: ComponentFixture<GameHistoriesPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameHistoriesPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameHistoriesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
