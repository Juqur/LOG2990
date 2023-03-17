/* eslint-disable @typescript-eslint/no-explicit-any */
//  TODO FIX THE LINT ISSUE, I CURRENTLY DO NOT KNOW HOW
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameData } from '@app/pages/game-page/game-page.component';
import { AudioService } from '@app/services/audioService/audio.service';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler.service';
import { Constants } from '@common/constants';
import { environment } from 'src/environments/environment';
import { GamePageService } from './game-page.service';

describe('GamePageService', () => {
    let service: GamePageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let mouseServiceSpy: jasmine.SpyObj<MouseService>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;

    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 0,
        amountOfDifferencesFound: 0,
        amountOfDifferencesFoundSecondPlayer: 0,
    };

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getCanClick', 'getX', 'getY', 'setClickState']);
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
        service.setPlayArea(playAreaComponentSpy, playAreaComponentSpy, playAreaComponentSpy);
        service['drawServiceDiff'] = drawServiceSpy;
        service['drawServiceOriginal'] = drawServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return false if a different is not found', () => {
        expect(service.validateResponse([])).toEqual(false);
    });
    it('should return true if a different is found', () => {
        expect(service.validateResponse([1])).toEqual(true);
    });

    it('should reset imagesData', () => {
        service['imagesData'] = [1];
        service.resetImagesData();
        expect(service['imagesData']).toEqual([]);
    });

    it('should correctly set default and difference images', () => {
        service.setImages(1);
        expect(service['originalImageSrc']).toEqual(environment.serverUrl + 'original/1.bmp');
        expect(service['diffImageSrc']).toEqual(environment.serverUrl + 'modified/1.bmp');
    });

    it('should return the mousePosition if it is valid', () => {
        mouseServiceSpy.getMousePosition.and.returnValue(1);
        expect(service.verifyClick(new MouseEvent('click'))).toEqual(1);
    });

    it('should return -1 if it is not valid', () => {
        mouseServiceSpy.getMousePosition.and.returnValue(null);
        expect(service.verifyClick(new MouseEvent('click'))).toEqual(Constants.minusOne);
    });

    it('should reset the audio service', () => {
        service.resetAudio();
        expect(audioServiceSpy.reset).toHaveBeenCalled();
    });

    it('should play a victory audio and open a victory dialog', () => {
        service.handleVictory();
        expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
        expect(audioServiceSpy.reset).toHaveBeenCalled();
        expect(audioServiceSpy.play).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['winGameDialogData'], service['closePath']);
    });

    it('should play a loss audio and open a loss dialog', () => {
        service.handleDefeat();
        expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/LossSound.mp3');
        expect(audioServiceSpy.reset).toHaveBeenCalled();
        expect(audioServiceSpy.play).toHaveBeenCalled();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['loseDialogData'], service['closePath']);
    });

    it('should set both play areas', () => {
        const playArea = new PlayAreaComponent(new DrawService(), new CanvasSharingService());
        service.setPlayArea(playArea, playArea, playArea);
        expect(service['originalPlayArea']).toEqual(playArea);
        expect(service['diffPlayArea']).toEqual(playArea);
        expect(service['tempDiffPlayArea']).toEqual(playArea);
    });

    it('should call handleAreaFoundInDiff if the area clicked was the difference canvas and a difference was found ', () => {
        const spy = spyOn<any>(service, 'handleAreaFoundInDiff');
        service.handleResponse(true, gameData, false);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInDiff if the area clicked was the difference canvas and a difference was not found', () => {
        const spy = spyOn<any>(service, 'handleAreaNotFoundInDiff');
        service.handleResponse(false, gameData, false);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
        const spy = spyOn<any>(service, 'handleAreaFoundInOriginal');
        service.handleResponse(true, gameData, true);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleAreaNotFoundInOriginal if the area clicked was the original canvas and a difference was not found', () => {
        const spy = spyOn<any>(service, 'handleAreaNotFoundInOriginal');
        service.handleResponse(false, gameData, true);
        expect(spy).toHaveBeenCalled();
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

    it('should correctly set the original images pixels onto the difference image', () => {
        const area = [0];
        const pickSpy = spyOn<any>(service, 'pick').and.returnValue([1, 2, 3]);
        service['copyArea'](area);
        expect(pickSpy).toHaveBeenCalledTimes(1);
    });
});
