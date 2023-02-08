import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the easy difficulty icon', () => {
        component.level.isEasy = true;
        expect(component.displayDifficultyIcon(component.level.isEasy)).toEqual('../../../assets/images/easy.png');
    });

    it('should display the hard difficulty icon', () => {
        component.level.isEasy = false;
        expect(component.displayDifficultyIcon(component.level.isEasy)).toEqual('../../../assets/images/hard.png');
    });

    it('should display the easy difficulty', () => {
        component.level.isEasy = true;
        expect(component.displayDifficulty()).toEqual('Easy');
    });

    it('should display the hard difficulty', () => {
        component.level.isEasy = false;
        expect(component.displayDifficulty()).toEqual('Hard');
    });
});
