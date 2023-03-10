/* eslint-disable @typescript-eslint/no-explicit-any */
//  TODO FIX THE LINT ISSUE, I CURRENTLY DO NOT KNOW HOW
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { GamePageService } from './game-page.service';
import { HttpClientModule } from '@angular/common/http';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { DialogData, PopUpService } from '@app/services/popUpService/pop-up.service';
import { AudioService } from '@app/services/audioService/audio.service';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DrawService } from '@app/services/drawService/draw.service';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { Level } from '@app/levels';
import { of } from 'rxjs';
import { GameData } from '@app/pages/game-page/game-page.component';
import { ElementRef } from '@angular/core';

describe('GamePageService', () => {
    let service: GamePageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let mouseServiceSpy: jasmine.SpyObj<MouseService>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;

    const gameData: GameData = {
        differences: [],
        amountOfDifferences: 0,
    };

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getCanClick', 'getX', 'getY', 'changeClickState']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog']);
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['play', 'create', 'reset']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['context', 'drawError']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['getCanvas', 'drawPlayArea', 'flashArea', 'timeout']);
        const canvas = document.createElement('canvas');
        const nativeElementMock = { nativeElement: canvas };
        playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        playAreaComponentSpy.timeout.and.returnValue(Promise.resolve());

        playAreaComponentSpy.timeout.and.returnValue(Promise.resolve());

        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: DrawService, useValue: drawServiceSpy },
            ],
        });
        service = TestBed.inject(GamePageService);
        service.setPlayArea(playAreaComponentSpy, playAreaComponentSpy);
        service['drawServiceDiff'] = drawServiceSpy;
        service['drawServiceOriginal'] = drawServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return -1 if the number of differences found is equal to the number of differences', () => {
        service.setNumberOfDifference(1);
        service.setDifferenceFound(1);
        expect(service.validateResponse([1])).toEqual(Constants.minusOne);
    });
    it('should return 0 if a different is not found', () => {
        expect(service.validateResponse([Constants.minusOne])).toEqual(0);
    });
    it('should return 1 if a different is found', () => {
        service.setNumberOfDifference(2);
        expect(service.validateResponse([1])).toEqual(1);
    });

    it('should send a click to the server', () => {
        service.sendClick(1);
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('game', 'onClick', { position: 1 });
    });

    it('should set the number of differences', () => {
        service.setDifferenceFound(1);
        expect(service['differencesFound']).toEqual(1);
    });

    it('should set both play areas', () => {
        const playArea = new PlayAreaComponent(new DrawService(), new CanvasSharingService());
        service.setPlayArea(playArea, playArea);
        expect(service['originalPlayArea']).toEqual(playArea);
        expect(service['diffPlayArea']).toEqual(playArea);
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
        spyOn(service['communicationService'], 'getLevel').and.returnValue(of(testLevel));
        const value = service.getLevelInformation(1);
        expect(value).toEqual(testLevel);
    });

    it('should throw an error if the level is not found', () => {
        const errorMessage = 'test error';
        spyOn(service['communicationService'], 'getLevel').and.throwError(errorMessage);

        expect(() => {
            service.getLevelInformation(1);
        }).toThrowError("Couldn't load level: Error: " + errorMessage);
    });

    it('should call handleAreaFoundInDiff if the area clicked was the difference canvas and a difference was found ', () => {
        const spy = spyOn<any>(service, 'handleAreaFoundInDiff');
        service.handleResponse(1, gameData, false);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInDiff if the area clicked was the difference canvas and a difference was not found', () => {
        const spy = spyOn<any>(service, 'handleAreaNotFoundInDiff');
        service.handleResponse(0, gameData, false);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
        const spy = spyOn<any>(service, 'handleAreaFoundInOriginal');
        service.handleResponse(1, gameData, true);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInOriginal if the area clicked was the original canvas and a difference was not found', () => {
        const spy = spyOn<any>(service, 'handleAreaNotFoundInOriginal');
        service.handleResponse(0, gameData, true);
        expect(spy).toHaveBeenCalled();
    });

    it('should play victory sound and show popup if the player has found all the differences', () => {
        const winGameDialogData: DialogData = {
            textToSend: 'Vous avez gagné!',
            closeButtonMessage: 'Retour au menu de sélection',
        };
        service.handleResponse(Constants.minusOne, gameData, true);
        expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(winGameDialogData, '/selection');
    });

    it('should return undefined when context is undefined when copying', () => {
        const area = [0];
        spyOn(service['diffPlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(null);
        spyOn<any>(service, 'pick').and.returnValue([1, 2, 3]);
        const returnValue = service['copyArea'](area);
        expect(returnValue).toBeUndefined();
    });

    it('handleAreaFoundInDiff should call multiple functions', () => {
        const result = [1, 2, 3];
        const audioSpy = spyOn(AudioService, 'quickPlay');
        service['handleAreaFoundInDiff'](result);
        expect(service['imagesData']).toEqual(result);
        service['imagesData'] = [];
        expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
    });

    it('handleAreaFoundInOriginal should call multiple functions', () => {
        const result = [1, 2, 3];
        const audioSpy = spyOn(AudioService, 'quickPlay');
        service['handleAreaFoundInOriginal'](result);
        expect(service['imagesData']).toEqual(result);
        service['imagesData'] = [];
        expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
    });

    it('handleAreaNotFoundInOriginal should call multiple functions', () => {
        const audioSpy = spyOn(AudioService, 'quickPlay');
        spyOn<any>(service, 'pick').and.returnValue([1, 2, 3]);
        service['handleAreaNotFoundInOriginal']();
        expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
    });

    it('handleAreaNotFoundInDiff should call multiple functions', () => {
        const audioSpy = spyOn(AudioService, 'quickPlay');
        service['handleAreaNotFoundInDiff']();
        expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
    });

    it('pick should get the color of the canvas', () => {
        const rgb = service['pick'](0, 0);
        expect(rgb).toEqual('rgba(0, 0, 0, 0)');
    });

    it('resetCanvas should refresh the area and copy a part of the original canvas', fakeAsync(() => {
        service['resetCanvas']();
        tick(Constants.millisecondsInOneSecond);
        expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
    }));
});
