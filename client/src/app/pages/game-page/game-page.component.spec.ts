import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
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
import { GamePageService } from '@app/services/game-page/game-page.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Subject } from 'rxjs';
import { GameData, GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subject: Subject<any>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
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
        gamePageServiceSpy = jasmine.createSpyObj('GamePageService', [
            'sendClick',
            'validateResponse',
            'setNumberOfDifference',
            'setDifferenceFound',
            'getLevelInformation',
            'setPlayArea',
            'handleResponse',
        ]);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        const canvas = document.createElement('canvas');
        const nativeElementMock = { nativeElement: canvas };
        playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        playAreaComponentSpy.timeout.and.returnValue(Promise.resolve());
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
                { provide: SocketHandler, useValue: socketHandlerSpy },
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
        expect(component['levelId']).toEqual(testParam.id);
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
        gamePageServiceSpy.getLevelInformation.and.returnValue(testLevel);
        spyOn(component, 'handleSocket').and.returnValue();
        component.ngOnInit();

        expect(gamePageServiceSpy.getLevelInformation).toHaveBeenCalledWith(component['levelId']);
        expect(component.currentLevel).toEqual(testLevel);
        expect(component.nbDiff).toEqual(testLevel.nbDifferences);
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

    it('should send mouse position to the server if you click on the original picture', () => {
        const mousePosition = 1;
        mouseServiceSpy.getCanClick.and.returnValue(true);
        mouseServiceSpy.getMousePosition.and.returnValue(mousePosition);
        component.clickedOnOriginal(new MouseEvent('click'));
        expect(gamePageServiceSpy.sendClick).toHaveBeenCalledWith(mousePosition);
        expect(mouseServiceSpy.getMousePosition).toHaveBeenCalled();
        expect(component['clickedOriginalImage']).toBe(true);
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
        expect(component['clickedOriginalImage']).toBe(false);
    });
});
