import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameHistory } from '@common/game-history';
import { of } from 'rxjs';
import { GameHistoriesPageComponent } from './game-histories-page.component';
import SpyObj = jasmine.SpyObj;

describe('GameHistoriesPageComponent', () => {
    let component: GameHistoriesPageComponent;
    let fixture: ComponentFixture<GameHistoriesPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    const gameHistoriesArray: GameHistory[] = [
        {
            startDate: new Date(),
            lengthGame: 10,
            isClassic: true,
            firstPlayerName: 'Gonzag',
            secondPlayerName: 'Gustave',
            hasPlayerAbandoned: false,
        },
    ];

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGameHistories', 'deleteGameHistories']);
        communicationServiceSpy.getGameHistories.and.returnValue(of(gameHistoriesArray));

        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [GameHistoriesPageComponent, ScaleContainerComponent, GameHistoryComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }, HttpClient, HttpHandler],
        }).compileComponents();

        fixture = TestBed.createComponent(GameHistoriesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onClearHistory should call deleteGameHistories', () => {
        communicationServiceSpy.deleteGameHistories.and.returnValue(of(undefined));
        component.onClearHistory();
        expect(communicationServiceSpy.deleteGameHistories).toHaveBeenCalledTimes(1);
    });
});
