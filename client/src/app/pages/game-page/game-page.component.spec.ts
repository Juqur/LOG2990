import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { GameChatComponent } from '@app/components/game-chat/game-chat.component';
import { GameTimerComponent } from '@app/components/game-timer/game-timer.component';
import { MessageBoxComponent } from '@app/components/message-box/message-box.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ScaleContainerComponent } from '@app/components/scale-container/scale-container.component';
import { Level } from '@app/levels';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameData, GamePageComponent } from '@app/pages/game-page/game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { GamePageService } from '@app/services/gamePageService/game-page.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
    let gamePageServiceSpy: SpyObj<GamePageService>;
    let socketHandlerSpy: SpyObj<SocketHandler>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let activatedRoute: SpyObj<ActivatedRoute>;

    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 1,
        amountOfDifferencesFound: 1,
        amountOfDifferencesFoundSecondPlayer: 1,
    };

    beforeEach(async () => {
        gamePageServiceSpy = jasmine.createSpyObj('GamePageService', [
            'verifyClick',
            'validateResponse',
            'resetAudio',
            'setImages',
            'setPlayArea',
            'handleResponse',
            'resetImagesData',
            'handleVictory',
            'handleDefeat',
        ]);
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getLevel']);
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['on', 'isSocketAlive', 'send', 'connect', 'removeListener']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        communicationServiceSpy.getLevel.and.returnValue(of({} as Level));
        activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        activatedRoute.snapshot.params = { id: 1 };
        activatedRoute.snapshot.queryParams = { playerName: 'Alice', opponent: 'Bob' };

        await TestBed.configureTestingModule({
            declarations: [
                GamePageComponent,
                PlayAreaComponent,
                GameTimerComponent,
                ScaleContainerComponent,
                GameChatComponent,
                ChatMessageComponent,
                MessageBoxComponent,
            ],
            imports: [AppMaterialModule, HttpClientModule, RouterTestingModule],
            providers: [
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: GamePageService, useValue: gamePageServiceSpy },
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRoute },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component['diffPlayArea'] = playAreaComponentSpy;
        component['originalPlayArea'] = playAreaComponentSpy;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset the audio when leaving the page', () => {
        component.ngOnDestroy();
        expect(gamePageServiceSpy.resetAudio).toHaveBeenCalled();
    });

    it('should set the opponents found differences correctly if it is a multiplayer match', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback(gameData as any);
            }
        });
        expect(component['secondPlayerDifferencesCount']).toEqual(1);
    });

    it('should not set the opponents found differences correctly if it is a solo match', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback(gameData as any);
            }
        });
        expect(component['secondPlayerDifferencesCount']).toEqual(0);
    });

    it('should set the amount of difference found by the player', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                callback(gameData as any);
            }
        });
        component.handleSocket();
        expect(component['playerDifferencesCount']).toEqual(1);
    });

    it('should handle victory if server sends victory request', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onVictory') {
                callback({} as never);
            }
        });
        component.handleSocket();
        expect(gamePageServiceSpy.handleVictory).toHaveBeenCalled();
    });

    it('should handle defeat if server sends defeat request', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onDefeat') {
                callback({} as never);
            }
        });
        component.handleSocket();
        expect(gamePageServiceSpy.handleDefeat).toHaveBeenCalled();
    });

    it('should set levelId, playerName and secondPlayerName from route', () => {
        spyOn(component, 'settingGameLevel');
        spyOn(component, 'settingGameImage');
        component.getGameLevel();
        expect(component['levelId']).toBe(1);
        expect(component.playerName).toBe('Alice');
        expect(component.secondPlayerName).toBe('Bob');
    });

    it('should call settingGameImage and settingGameLevel when getting the game level', () => {
        const settingGameLevelSpy = spyOn(component, 'settingGameLevel');
        const settingGameImageSpy = spyOn(component, 'settingGameImage');
        component.getGameLevel();
        expect(settingGameLevelSpy).toHaveBeenCalled();
        expect(settingGameImageSpy).toHaveBeenCalled();
    });

    it('should send mouse position to the server if you click on the original picture', () => {
        const event: MouseEvent = new MouseEvent('click');
        const mousePositionReturnValue = 1;
        gamePageServiceSpy.verifyClick.and.returnValue(mousePositionReturnValue);
        component.clickedOnOriginal(event);
        expect(gamePageServiceSpy.verifyClick).toHaveBeenCalledWith(event);
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onClick', mousePositionReturnValue);
        expect(component['clickedOriginalImage']).toBe(true);
    });

    it('should not send if the mouse position is undefined if clicked on the original image', () => {
        const event: MouseEvent = new MouseEvent('click');
        gamePageServiceSpy.verifyClick.and.returnValue(Constants.minusOne);
        component.clickedOnOriginal(event);
        expect(gamePageServiceSpy.verifyClick).toHaveBeenCalledWith(event);
        expect(socketHandlerSpy.send).not.toHaveBeenCalled();
    });

    it('should not send if the mouse position is undefined if clicked on the difference image', () => {
        const event: MouseEvent = new MouseEvent('click');
        gamePageServiceSpy.verifyClick.and.returnValue(Constants.minusOne);
        component.clickedOnDiff(event);
        expect(gamePageServiceSpy.verifyClick).toHaveBeenCalledWith(event);
        expect(socketHandlerSpy.send).not.toHaveBeenCalled();
    });

    it('should send mouse position to the server if you click on the difference picture', () => {
        const event: MouseEvent = new MouseEvent('click');
        const mousePositionReturnValue = 1;
        gamePageServiceSpy.verifyClick.and.returnValue(mousePositionReturnValue);
        component.clickedOnDiff(event);
        expect(gamePageServiceSpy.verifyClick).toHaveBeenCalledWith(event);
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onClick', mousePositionReturnValue);
        expect(component['clickedOriginalImage']).toBe(false);
    });

    it('should throw and error if the client cannot get information from the server', () => {
        communicationServiceSpy.getLevel.and.throwError('Error');
        expect(component.settingGameLevel).toThrowError();
    });
});
