import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
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
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { GamePageService } from '@app/services/gamePageService/game-page.service';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';
import { GameData } from '@common/game-data';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
    let gamePageServiceSpy: SpyObj<GamePageService>;
    let socketHandlerSpy: SpyObj<SocketHandler>;
    let activatedRoute: SpyObj<ActivatedRoute>;

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
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['on', 'isSocketAlive', 'send', 'connect', 'removeListener']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        activatedRoute.snapshot.params = { id: 1 };
        activatedRoute.snapshot.queryParams = { playerName: 'Alice', opponent: 'Bob' };
    });

    beforeEach(async () => {
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
            imports: [AppMaterialModule, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: GamePageService, useValue: gamePageServiceSpy },
                { provide: CommunicationService },
                { provide: ActivatedRoute, useValue: activatedRoute },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component['diffPlayArea'] = playAreaComponentSpy;
        component['originalPlayArea'] = playAreaComponentSpy;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        let settingGameParametersSpy: jasmine.Spy;
        let handleSocketSpy: jasmine.Spy;

        beforeEach(() => {
            settingGameParametersSpy = spyOn(component, 'settingGameParameters' as never);
            handleSocketSpy = spyOn(component, 'handleSocket');
        });

        it('should call resetImagesData', () => {
            component.ngOnInit();
            expect(gamePageServiceSpy.resetImagesData).toHaveBeenCalled();
        });

        it('should call settingGameParameters', () => {
            component.ngOnInit();
            expect(settingGameParametersSpy).toHaveBeenCalled();
        });

        it('should call handleSocket', () => {
            component.ngOnInit();
            expect(handleSocketSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should reset the audio when leaving the page', () => {
            component.ngOnDestroy();
            expect(gamePageServiceSpy.resetAudio).toHaveBeenCalled();
        });

        it('should remove the onProcessedClick listener', () => {
            component.ngOnDestroy();
            expect(socketHandlerSpy.removeListener).toHaveBeenCalledWith('game', 'processedClick');
        });

        it('should remove the onVictory listener', () => {
            component.ngOnDestroy();
            expect(socketHandlerSpy.removeListener).toHaveBeenCalledWith('game', 'victory');
        });

        it('should remove the onDefeat listener', () => {
            component.ngOnDestroy();
            expect(socketHandlerSpy.removeListener).toHaveBeenCalledWith('game', 'defeat');
        });
    });

    describe('handleSocket', () => {
        it('should set the opponents found differences correctly if it is a multiplayer match', () => {
            const expectedDifferences = 5;
            const data = { amountOfDifferencesFoundSecondPlayer: expectedDifferences } as unknown as GameData;
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'processedClick') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(component['secondPlayerDifferencesCount']).toEqual(expectedDifferences);
        });

        it('should not set the opponents found differences correctly if it is a solo match', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'processedClick') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(component['secondPlayerDifferencesCount']).toEqual(0);
        });

        it('should set the amount of difference found by the player', () => {
            const expectedDifferences = 5;
            const data = { amountOfDifferencesFound: expectedDifferences } as unknown as GameData;
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'processedClick') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(component['playerDifferencesCount']).toEqual(expectedDifferences);
        });

        it('should handle victory if server sends victory request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'victory') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleVictory).toHaveBeenCalledTimes(1);
        });

        it('should handle defeat if server sends defeat request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'defeat') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleDefeat).toHaveBeenCalledTimes(1);
        });
    });

    describe('abandonGame', () => {
        it('should emit a socket event when abandoning the game', () => {
            component.abandonGame();
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onAbandonGame');
        });
    });

    describe('clickedOnOriginal', () => {
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
            const invalid = -1;
            const event: MouseEvent = new MouseEvent('click');
            gamePageServiceSpy.verifyClick.and.returnValue(invalid);
            component.clickedOnOriginal(event);
            expect(gamePageServiceSpy.verifyClick).toHaveBeenCalledWith(event);
            expect(socketHandlerSpy.send).not.toHaveBeenCalled();
        });
    });

    describe('clickedOnDiff', () => {
        it('should not send if the mouse position is undefined if clicked on the difference image', () => {
            const invalid = -1;
            const event: MouseEvent = new MouseEvent('click');
            gamePageServiceSpy.verifyClick.and.returnValue(invalid);
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
    });

    describe('settingGameParameters', () => {
        it('should set levelId, playerName and secondPlayerName from route', () => {
            spyOn(component, 'settingGameLevel' as never);
            spyOn(component, 'settingGameImage' as never);
            component['settingGameParameters']();
            expect(component['levelId']).toBe(1);
            expect(component.playerName).toBe('Alice');
            expect(component.secondPlayerName).toBe('Bob');
        });

        it('should call settingGameImage and settingGameLevel when getting the game level', () => {
            const settingGameLevelSpy = spyOn(component, 'settingGameLevel' as never);
            const settingGameImageSpy = spyOn(component, 'settingGameImage' as never);
            component['settingGameParameters']();
            expect(settingGameLevelSpy).toHaveBeenCalled();
            expect(settingGameImageSpy).toHaveBeenCalled();
        });
    });

    describe('settingGameLevel', () => {
        it('should set the levelId from the route', fakeAsync(() => {
            const level = { value: { nbDifferences: 1 } } as unknown as Level;
            spyOn(component['communicationService'], 'getLevel').and.returnValue(of(level));
            component['settingGameLevel']();
            expect(component['currentLevel']).toEqual(level);
        }));

        it('should throw an error if the level is not found', fakeAsync(() => {
            spyOn(component['communicationService'], 'getLevel').and.returnValue(undefined as never);
            try {
                component['settingGameLevel']();
            } catch (error) {
                expect(error).toBeDefined();
            }
        }));
    });

    describe('settingGameImage', () => {
        it('should set the url properly for both images', () => {
            component['levelId'] = 1;
            component['settingGameImage']();
            expect(component['originalImageSrc']).toBe('http://localhost:3000/original/1.bmp');
            expect(component['diffImageSrc']).toBe('http://localhost:3000/modified/1.bmp');
        });
    });
});
