import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHistory } from '@common/game-history';
import { TestConstants } from '@common/test-constants';
import { GameHistoryComponent } from './game-history.component';

describe('GameHistoryComponent', () => {
    let component: GameHistoryComponent;
    let fixture: ComponentFixture<GameHistoryComponent>;
    let gameHistory: GameHistory;

    beforeEach(async () => {
        gameHistory = {
            startDate: new Date(),
            lengthGame: 10,
            isClassic: true,
            firstPlayerName: 'Gonzag',
            secondPlayerName: 'Gustave',
            hasPlayerAbandoned: false,
        };
        await TestBed.configureTestingModule({
            declarations: [GameHistoryComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameHistoryComponent);
        component = fixture.componentInstance;
        component['gameHistory'] = gameHistory;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly format the time', () => {
        const time = 100;
        const expectedResult = '1min 40s';
        const result = component.parseTime(time);
        expect(result).toEqual(expectedResult);
    });

    it('should correctly format the Date', () => {
        // DD month YYYY à HH:MM
        const date = new Date();
        date.setDate(1);
        date.setMonth(0);
        date.setFullYear(TestConstants.CURRENT_YEAR);
        date.setHours(1, 2);
        const expectedResult = '1 janvier 2023 à 01:02';
        const result = component.parseDate(date);
        expect(result).toEqual(expectedResult);
    });
});
