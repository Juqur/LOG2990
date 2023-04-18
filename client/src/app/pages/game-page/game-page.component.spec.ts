/* eslint-disable max-lines */
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
import { CommunicationService } from '@app/services/communication/communication.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
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
            'handleOpponentAbandon',
            'handleDefeat',
            'startCheatMode',
            'stopCheatMode',
            'preventJoining',
            'setMouseCanClick',
            'handleTimedModeFinished',
            'handleHintRequest',
            'handleHintShapeRequest',
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
        const canvas = document.createElement('canvas');
        const nativeElementMock = { nativeElement: canvas };
        component['hintShapeCanvas'] = nativeElementMock;
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

        it('should call preventJoining if socket is not alive', () => {
            socketHandlerSpy.isSocketAlive.and.returnValue(false);
            component.ngOnInit();
            expect(gamePageServiceSpy.preventJoining).toHaveBeenCalledTimes(1);
        });

        it('should call resetImagesData', () => {
            component.ngOnInit();
            expect(gamePageServiceSpy.resetImagesData).toHaveBeenCalledTimes(1);
        });

        it('should call settingGameParameters', () => {
            component.ngOnInit();
            expect(settingGameParametersSpy).toHaveBeenCalledTimes(1);
        });

        it('should call handleSocket', () => {
            component.ngOnInit();
            expect(handleSocketSpy).toHaveBeenCalledTimes(1);
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

        it('should not set the images if the game mode is not classic', () => {
            component['isClassic'] = false;
            const data = { differencePixels: [1] } as unknown as GameData;
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'processedClick') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.setImages).not.toHaveBeenCalled();
            expect(gamePageServiceSpy.setPlayArea).not.toHaveBeenCalled();
            expect(gamePageServiceSpy.handleResponse).not.toHaveBeenCalled();
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

        it('should call removeHintShape if response is true and showThirdHint is true', () => {
            const data = { amountOfDifferencesFound: 5 } as unknown as GameData;
            const removeHintShapeSpy = spyOn(component, 'removeHintShape');
            component['showThirdHint'] = true;
            gamePageServiceSpy.handleResponse.and.returnValue(true);
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'processedClick') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(removeHintShapeSpy).toHaveBeenCalled();
        });

        it('should handle abandon if server sends opponent abandoned request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'opponentAbandoned') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleOpponentAbandon).toHaveBeenCalledTimes(1);
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

        it('should handle victory if server sends victory request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'victory') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleVictory).toHaveBeenCalledTimes(1);
        });

        it('should handle cheat mode if server sends startCheatMode request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'startCheatMode') {
                    callback({} as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.startCheatMode).toHaveBeenCalledTimes(1);
        });

        it('should handle handleHintShapeRequest if server sends hintRequest on the first hint', () => {
            component['nbHints'] = 2;
            const data = [1];
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'hintRequest') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleHintRequest).toHaveBeenCalledWith(data);
            expect(component['nbHints']).toEqual(1);
        });

        it('should handle handleHintShapeRequest if server sends hintRequest on the last hint', () => {
            component['nbHints'] = 1;
            const data: number[] = [];
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'hintRequest') {
                    callback(data as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleHintShapeRequest).toHaveBeenCalledWith(data, component['hintShapeCanvas'].nativeElement);
            expect(component['nbHints']).toEqual(0);
        });
    });

    describe('askForHint', () => {
        it('should set playArea and emit a socket event if in single player', () => {
            component['secondPlayerName'] = '';
            component.askForHint();
            expect(gamePageServiceSpy.setPlayArea).toHaveBeenCalled();
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onHintRequest');
        });
    });

    describe('removeHintShape', () => {
        it('should clear the hintShapeCanvas and set showThirdHint to false', () => {
            component['showThirdHint'] = true;
            const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
            component.removeHintShape();
            expect(clearRectSpy).toHaveBeenCalled();
            expect(component['showThirdHint']).toBe(false);
        });
        it('should handle the end of a timed game if server sends timedModeFinished request', () => {
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'timedModeFinished') {
                    callback(true as never);
                }
            });
            component.handleSocket();
            expect(gamePageServiceSpy.handleTimedModeFinished).toHaveBeenCalledWith(true);
        });

        it('should handle changing the pictures if server sends changeLevelTimedMode request, and call removeHintShape if showThirdHint is true', () => {
            const level = { id: 1 } as unknown as Level;
            socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
                if (eventName === 'changeLevelTimedMode') {
                    callback(level as never);
                }
            });
            const settingGameImageSpy = spyOn(component, 'settingGameImage' as never);
            const removeHintShapeSpy = spyOn(component, 'removeHintShape');
            component['showThirdHint'] = true;
            component.handleSocket();
            expect(component['levelId']).toEqual(1);
            expect(component['currentLevel']).toEqual(level);
            expect(settingGameImageSpy).toHaveBeenCalledTimes(1);
            expect(gamePageServiceSpy.resetImagesData).toHaveBeenCalledTimes(1);
            expect(gamePageServiceSpy.setMouseCanClick).toHaveBeenCalledWith(true);
            expect(gamePageServiceSpy.setImages).toHaveBeenCalledTimes(1);
            expect(removeHintShapeSpy).toHaveBeenCalledTimes(1);
        });

        describe('abandonGame', () => {
            it('should emit a socket event when abandoning the game', () => {
                component.abandonGame();
                expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onAbandonGame');
            });
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
            expect(settingGameLevelSpy).toHaveBeenCalledTimes(1);
            expect(settingGameImageSpy).toHaveBeenCalledTimes(1);
        });

        it('should not set level and image if levelId is 0', () => {
            activatedRoute.snapshot.params = { id: '0' };
            const settingGameLevelSpy = spyOn(component, 'settingGameLevel' as never);
            const settingGameImageSpy = spyOn(component, 'settingGameImage' as never);
            component['settingGameParameters']();
            expect(component['isClassic']).toEqual(false);
            expect(settingGameLevelSpy).not.toHaveBeenCalledTimes(1);
            expect(settingGameImageSpy).not.toHaveBeenCalledTimes(1);
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

    describe('abandonGame', () => {
        it('should emit a socket event when abandoning the game', () => {
            component.abandonGame();
            expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onAbandonGame');
        });
    });

    describe('handleKeyDownEvent', () => {
        it('should make appropriate calls to functions if we are not in cheat mode', () => {
            const key = new KeyboardEvent('keydown', { key: 't' });
            const target = { tagName: 'BODY' } as HTMLElement;
            spyOnProperty(key, 'target', 'get').and.returnValue(target);

            component.isInCheatMode = false;
            component.handleKeyDownEvent(key);
            expect(socketHandlerSpy.send).toHaveBeenCalledOnceWith('game', 'onStartCheatMode');
            expect(gamePageServiceSpy.setPlayArea).toHaveBeenCalledTimes(1);
            expect(gamePageServiceSpy.setImages).toHaveBeenCalledTimes(1);
            expect(component.isInCheatMode).toBeTrue();
        });

        it('should make appropriate calls to functions if we are in cheat mode', () => {
            const key = new KeyboardEvent('keydown', { key: 'T' });
            const target = { tagName: 'BODY' } as HTMLElement;
            spyOnProperty(key, 'target', 'get').and.returnValue(target);

            component.isInCheatMode = true;
            component.handleKeyDownEvent(key);
            expect(socketHandlerSpy.send).toHaveBeenCalledOnceWith('game', 'onStopCheatMode');
            expect(gamePageServiceSpy.stopCheatMode).toHaveBeenCalledTimes(1);
        });

        it('should call askForHint if the right key is pressed', () => {
            const hintSpy = spyOn(component, 'askForHint');
            const keyLowerCase = new KeyboardEvent('keydown', { key: 'i' });
            const keyUpperCase = new KeyboardEvent('keydown', { key: 'I' });
            const target = { tagName: 'BODY' } as HTMLElement;
            spyOnProperty(keyLowerCase, 'target', 'get').and.returnValue(target);
            spyOnProperty(keyUpperCase, 'target', 'get').and.returnValue(target);

            component.handleKeyDownEvent(keyLowerCase);
            expect(hintSpy).toHaveBeenCalledTimes(1);
            component.handleKeyDownEvent(keyUpperCase);
            expect(hintSpy).toHaveBeenCalledTimes(2);
        });

        it('should not start cheat mode or ask for hint when a key other than "t" is pressed', () => {
            const hintSpy = spyOn(component, 'askForHint');
            const key = new KeyboardEvent('keydown', { key: 'a' });
            const target = { tagName: 'BODY' } as HTMLElement;
            spyOnProperty(key, 'target', 'get').and.returnValue(target);

            component.isInCheatMode = false;
            expect(hintSpy).not.toHaveBeenCalled();
            expect(socketHandlerSpy.send).not.toHaveBeenCalled();
            expect(gamePageServiceSpy.setPlayArea).not.toHaveBeenCalled();
            expect(gamePageServiceSpy.setImages).not.toHaveBeenCalled();
            expect(component.isInCheatMode).toBeFalsy();
        });
    });
});
