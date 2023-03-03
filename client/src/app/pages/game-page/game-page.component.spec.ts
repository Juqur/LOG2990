import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
import { AudioService } from '@app/services/audio.service';
import { DrawService } from '@app/services/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { MouseService } from '@app/services/mouse.service';
import { DialogData, PopUpServiceService } from '@app/services/pop-up-service.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { of, Subject } from 'rxjs';
import { GameData, GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subject: Subject<any>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
    let audioServiceSpy: SpyObj<AudioService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let popUpServiceSpy: SpyObj<PopUpServiceService>;
    let gamePageServiceSpy: SpyObj<GamePageService>;
    const socketHandlerSpy = {
        on: jasmine.createSpy(),
        isSocketAlive: jasmine.createSpy().and.returnValue(false),
        send: jasmine.createSpy(),
        connect: jasmine.createSpy(),
        disconnect: jasmine.createSpy(),
    };

    const gameData: GameData = {
        differences: [],
        amountOfDifferences: 1,
        amountOfDifferencesSecondPlayer: 1,
    };

    beforeEach(async () => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getCanClick', 'getX', 'getY', 'changeClickState']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpServiceService', ['openDialog']);
        gamePageServiceSpy = jasmine.createSpyObj('GamePageService', ['sendClick', 'validateResponse', 'setNumberOfDifference']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        const canvas = document.createElement('canvas');
        const nativeElementMock = { nativeElement: canvas };
        playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        playAreaComponentSpy.timeout.and.returnValue(Promise.resolve());
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['playSound']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawError']);
        subject = new Subject();

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
                { provide: ActivatedRoute, useValue: { params: subject.asObservable(), queryParams: subject.asObservable() } },
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: PopUpServiceService, useValue: popUpServiceSpy },
                { provide: GamePageService, useValue: gamePageServiceSpy },
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

    it('should retrieve the game id from the url', () => {
        const testParam = { id: 123 };
        subject.next(testParam);
        expect(component.levelId).toEqual(testParam.id);
    });

    it('should load level and update properties', () => {
        const testLevel: Level = {
            id: 1,
            name: 'test',
            playerSolo: [],
            timeSolo: [],
            playerMulti: [],
            timeMulti: [],
            isEasy: false,
            nbDifferences: 0,
        };
        const getLevelSpy = spyOn(component['communicationService'], 'getLevel').and.returnValue(of(testLevel));
        component.ngOnInit();

        expect(getLevelSpy).toHaveBeenCalledWith(component.levelId);
        expect(component.currentLevel).toEqual(testLevel);
        expect(component.nbDiff).toEqual(testLevel.nbDifferences);
        expect(gamePageServiceSpy.setNumberOfDifference).toHaveBeenCalledWith(testLevel.nbDifferences);
    });

    it('should throw error if level cannot be loaded', () => {
        const errorMessage = 'test error';
        spyOn(component['communicationService'], 'getLevel').and.throwError(errorMessage);

        expect(() => {
            component.ngOnInit();
        }).toThrowError("Couldn't load level: Error: " + errorMessage);
    });

    it('should properly assign names in a multiplayer game', () => {
        const data = ['name1', 'name2'];
        component['playerName'] = 'name1';
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onSecondPlayerJoined') {
                callback(data);
            }
        });
        component.handleSocket();
        expect(data).toEqual(['name1', 'name2']);
        expect(component['secondPlayerName']).toEqual('name2');
    });

    it('should set the opponents found differences correctly if it is a multiplayer match', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        component.handleSocket();
        expect(component['secondPlayerDifferencesCount']).toEqual(1);
    });
    it('should set the amount of difference found by the player', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        component.handleSocket();
        expect(component['playerDifferencesCount']).toEqual(1);
    });

    it('should call handleAreaFoundInDiff if the area clicked was the difference canvas and a difference was found ', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        const handleAreaFoundInDiffSpy = spyOn(component, 'handleAreaFoundInDiff');
        gamePageServiceSpy.validateResponse.and.returnValue(1);
        component['defaultArea'] = false;
        component.handleSocket();
        expect(handleAreaFoundInDiffSpy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInDiff if the area clicked was the difference canvas and a difference was not found', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        const handleAreaNotFoundInDiffSpy = spyOn(component, 'handleAreaNotFoundInDiff');
        gamePageServiceSpy.validateResponse.and.returnValue(0);
        component['defaultArea'] = false;
        component.handleSocket();
        expect(handleAreaNotFoundInDiffSpy).toHaveBeenCalled();
    });

    it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        const handleAreaFoundInOriginalSpy = spyOn(component, 'handleAreaFoundInOriginal');
        gamePageServiceSpy.validateResponse.and.returnValue(1);
        component['defaultArea'] = true;
        component.handleSocket();
        expect(handleAreaFoundInOriginalSpy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInOriginal if the area clicked was the original canvas and a difference was not found', () => {
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        const handleAreaNotFoundInOriginalSpy = spyOn(component, 'handleAreaNotFoundInOriginal');
        gamePageServiceSpy.validateResponse.and.returnValue(0);
        component['defaultArea'] = true;
        component.handleSocket();
        expect(handleAreaNotFoundInOriginalSpy).toHaveBeenCalled();
    });

    it('should play victory sound and show popup if the player has found all the differences', () => {
        const winGameDialogData: DialogData = {
            textToSend: 'Vous avez gagné!',
            closeButtonMessage: 'Retour au menu de sélection',
        };
        socketHandlerSpy.on.and.callFake((event, eventName, callback) => {
            if (eventName === 'onProcessedClick') {
                callback(gameData);
            }
        });
        gamePageServiceSpy.validateResponse.and.returnValue(Constants.minusOne);
        component.handleSocket();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(winGameDialogData, '/selection');
        expect(audioServiceSpy.playSound).toHaveBeenCalled();
        expect(audioServiceSpy.playSound).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
    });

    it('should send mouse position to the server if you click on the original picture', () => {
        const mousePosition = 1;
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.getMousePosition.and.returnValue(mousePosition);
        component.clickedOnOriginal(new MouseEvent('click'));
        expect(gamePageServiceSpy.sendClick).toHaveBeenCalledWith(mousePosition);
        expect(mouseServiceSpy.getMousePosition).toHaveBeenCalled();
        expect(component['defaultArea']).toBe(true);
    });

    it('should if the mouse position is undefined if clicked on the original image', () => {
        const mousePosition = 0;
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.getMousePosition.and.returnValue(mousePosition);
        component.clickedOnOriginal(new MouseEvent('click'));
        expect(gamePageServiceSpy.sendClick).not.toHaveBeenCalled();
    });

    it('should if the mouse position is undefined if clicked on the difference image', () => {
        const mousePosition = 0;
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.getMousePosition.and.returnValue(mousePosition);
        component.clickedOnDiff(new MouseEvent('click'));
        expect(gamePageServiceSpy.sendClick).not.toHaveBeenCalled();
    });

    it('should send mouse position to the server if you click on the difference picture', () => {
        const mousePosition = 1;
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.getMousePosition.and.returnValue(mousePosition);
        component.clickedOnDiff(new MouseEvent('click'));
        expect(gamePageServiceSpy.sendClick).toHaveBeenCalledWith(mousePosition);
        expect(mouseServiceSpy.getMousePosition).toHaveBeenCalled();
        expect(component['defaultArea']).toBe(false);
    });

    it('should return undefined when context is undefined when copying', () => {
        const area = [0];
        spyOn(component.diffPlayArea.getCanvas().nativeElement, 'getContext').and.returnValue(null);
        const returnValue = component.copyArea(area);
        expect(returnValue).toBeUndefined();
    });

    it('handleAreaFoundInDiff should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        component.handleAreaFoundInDiff(result);
        expect(component.imagesData).toEqual(result);
        expect(component.foundADifference).toBe(true);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
    });

    it('handleAreaFoundInOriginal should call multiple functions', () => {
        const result = [1, 2, 3];
        const spyFlashAreaOriginal = spyOn(component.originalPlayArea, 'flashArea');
        const spyFlashAreaDiff = spyOn(component.diffPlayArea, 'flashArea');
        const spyResetCanvas = spyOn(component, 'resetCanvas');
        component.handleAreaFoundInOriginal(result);
        expect(component.imagesData).toEqual(result);
        expect(component.foundADifference).toBe(true);
        expect(spyFlashAreaOriginal).toHaveBeenCalledTimes(1);
        expect(spyFlashAreaDiff).toHaveBeenCalledTimes(1);
        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
    });

    it('handleAreaNotFoundInOriginal should call multiple functions', () => {
        const spyResetCanvas = spyOn(component, 'resetCanvas');
        component.handleAreaNotFoundInOriginal();
        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
    });

    it('handleAreaNotFoundInDiff should call multiple functions', () => {
        const spyResetCanvas = spyOn(component, 'resetCanvas');
        component.handleAreaNotFoundInDiff();
        expect(spyResetCanvas).toHaveBeenCalledTimes(1);
    });

    it('pick should get the color of the canvas', () => {
        const rgb = component.pick(1, 1);
        expect(rgb).toEqual('rgba(0, 0, 0, 0)');
    });

    it('resetCanvas should refresh the area and copy a part of the original canvas', fakeAsync(() => {
        const spyDiffDrawPlayArea = spyOn(component.diffPlayArea, 'drawPlayArea');
        const spyOriginalDrawPlayArea = spyOn(component.originalPlayArea, 'drawPlayArea');
        const copyAreaSpy = spyOn(component, 'copyArea');
        component.resetCanvas();
        tick(Constants.millisecondsInOneSecond);
        expect(spyDiffDrawPlayArea).toHaveBeenCalledTimes(1);
        expect(spyOriginalDrawPlayArea).toHaveBeenCalledTimes(1);
        tick(Constants.thirty);
        expect(copyAreaSpy).toHaveBeenCalledTimes(1);
    }));
});
