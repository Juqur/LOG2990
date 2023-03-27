/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AudioService } from '@app/services/audio/audio.service';
import { DrawService } from '@app/services/draw/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/game-data';
import { environment } from 'src/environments/environment';

describe('GamePageService', () => {
    let service: GamePageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let mouseServiceSpy: jasmine.SpyObj<MouseService>;
    let popUpServiceSpy: jasmine.SpyObj<PopUpService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 0,
        amountOfDifferencesFound: 0,
        amountOfDifferencesFoundSecondPlayer: 0,
    };

    beforeEach(() => {
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getX', 'getY']);
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
            imports: [HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: routerSpy },
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

    describe('validateResponse', () => {
        it('should return false if a different is not found', () => {
            expect(service.validateResponse([])).toEqual(false);
        });

        it('should return true if a different is found', () => {
            expect(service.validateResponse([1])).toEqual(true);
        });
    });

    describe('setPlayArea', () => {
        it('should set all areas', () => {
            const playArea = playAreaComponentSpy;
            service.setPlayArea(playArea, playArea, playArea);
            expect(service['originalPlayArea']).toEqual(playArea);
            expect(service['diffPlayArea']).toEqual(playArea);
            expect(service['tempDiffPlayArea']).toEqual(playArea);
        });
    });

    describe('verifyClick', () => {
        it('should return the mousePosition if it is valid', () => {
            mouseServiceSpy.getMousePosition.and.returnValue(1);
            expect(service.verifyClick(new MouseEvent('click'))).toEqual(1);
        });

        it('should return -1 if it is not valid', () => {
            const expected = -1;
            mouseServiceSpy.getMousePosition.and.returnValue(null);
            expect(service.verifyClick(new MouseEvent('click'))).toEqual(expected);
        });
    });

    describe('resetAudio', () => {
        it('should reset the audio service', () => {
            service.resetAudio();
            expect(audioServiceSpy.reset).toHaveBeenCalled();
        });
    });

    describe('resetImagesData', () => {
        it('should reset imagesData', () => {
            service['imagesData'] = [1];
            service.resetImagesData();
            expect(service['imagesData']).toEqual([]);
        });
    });

    describe('setImages', () => {
        it('should correctly set default and difference images', () => {
            service.setImages(1);
            expect(service['originalImageSrc']).toEqual(environment.serverUrl + 'original/1.bmp');
            expect(service['diffImageSrc']).toEqual(environment.serverUrl + 'modified/1.bmp');
        });
    });

    describe('handleVictory', () => {
        it('should call create', () => {
            service.handleVictory();
            expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
        });

        it('should call reset', () => {
            service.handleVictory();
            expect(audioServiceSpy.reset).toHaveBeenCalled();
        });

        it('should call play', () => {
            service.handleVictory();
            expect(audioServiceSpy.play).toHaveBeenCalled();
        });

        it('should call openDialog', () => {
            service.handleVictory();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['winGameDialogData'], service['closePath']);
        });
    });

    describe('handleOpponentAbandon', () => {
        it('should call create', () => {
            service.handleOpponentAbandon();
            expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
        });

        it('should call reset', () => {
            service.handleOpponentAbandon();
            expect(audioServiceSpy.reset).toHaveBeenCalled();
        });

        it('should call play', () => {
            service.handleOpponentAbandon();
            expect(audioServiceSpy.play).toHaveBeenCalled();
        });

        it('should call openDialog', () => {
            service.handleOpponentAbandon();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['opponentAbandonedGameDialogData'], service['closePath']);
        });
    });

    describe('handleDefeat', () => {
        it('should call create', () => {
            service.handleDefeat();
            expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/LossSound.mp3');
        });

        it('should call reset', () => {
            service.handleDefeat();
            expect(audioServiceSpy.reset).toHaveBeenCalled();
        });

        it('should call play', () => {
            service.handleDefeat();
            expect(audioServiceSpy.play).toHaveBeenCalled();
        });

        it('should call openDialog', () => {
            service.handleDefeat();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['loseDialogData'], service['closePath']);
        });
    });

    describe('preventJoining', () => {
        it('should call navigate', () => {
            service.preventJoining();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('pick', () => {
        it('should return undefined when context is undefined when copying', () => {
            const area = [0];
            spyOn(service['diffPlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(null);
            spyOn(service, 'pick' as never);
            const returnValue = service['copyArea'](area);
            expect(returnValue).toBeUndefined();
        });

        it('pick should get the color of the canvas', () => {
            const rgb = service['pick'](0, 0);
            expect(rgb).toEqual('rgba(0, 0, 0, 0)');
        });
    });

    describe('handleResponse', () => {
        it('should call handleAreaFoundInDiff if the area clicked was the difference canvas and a difference was found ', () => {
            const spy = spyOn(service, 'handleAreaFoundInDiff' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            service.handleResponse(false, gameData, false);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaNotFoundInDiff if the area clicked was the difference canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInDiff' as never);
            service.handleResponse(false, gameData, false);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
            const spy = spyOn(service, 'handleAreaFoundInOriginal' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            service.handleResponse(false, gameData, true);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaNotFoundInOriginal if the area clicked was the original canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInOriginal' as never);
            service.handleResponse(false, gameData, true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('copyArea', () => {
        it('should correctly set the original images pixels onto the difference image', () => {
            const area = [0];
            const pickSpy = spyOn(service, 'pick' as never);
            service['copyArea'](area);
            expect(pickSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('resetCanvas', () => {
        it('should call drawPlayArea twice', fakeAsync(() => {
            const delay = 1000;
            service['resetCanvas']();
            tick(delay);
            expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
        }));
    });

    describe('handleAreaFoundInDiff', () => {
        let resetCanvasSpy: jasmine.Spy;
        let audioSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
        });

        it('should push the difference array correctly in imagesData', () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInDiff'](expectedArray, false);
            expect(service['imagesData']).toEqual(expectedArray);
        });

        it('should correctly filter areaNotFOund in handleAreaFoundInDiff', () => {
            service['areaNotFound'] = [0, 1, 2, 3];
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInDiff'](expectedArray, true);
            expect(service['areaNotFound']).toEqual([3]);
        });

        it('should call quickPlay', () => {
            service['handleAreaFoundInDiff']([], false);
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        });

        it('should call flashArea', () => {
            service['handleAreaFoundInDiff']([], false);
            expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        });

        it('should call reset canvas', () => {
            service['handleAreaFoundInDiff']([], false);
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleAreaNotFoundInDiff', () => {
        const mockCanvas = document.createElement('canvas');
        let resetCanvasSpy: jasmine.Spy;
        let audioSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
            spyOn(service['diffPlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
        });

        it('should call quickPlay', () => {
            service['handleAreaNotFoundInDiff']();
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });

        it('should call drawError', () => {
            service['handleAreaNotFoundInDiff']();
            expect(drawServiceSpy.drawError).toHaveBeenCalledTimes(1);
        });

        it('should call reset canvas', () => {
            service['handleAreaNotFoundInDiff']();
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleAreaFoundInOriginal', () => {
        let resetCanvasSpy: jasmine.Spy;
        let audioSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
        });

        it('should push the difference array correctly in imagesData', () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInOriginal'](expectedArray, false);
            expect(service['imagesData']).toEqual(expectedArray);
        });

        it('should correctly filter areaNotFound in handleAreaFoundInOriginal', () => {
            const expectedArray = [0, 1, 2];
            service['areaNotFound'] = [0, 1, 2, 3];
            service['handleAreaFoundInOriginal'](expectedArray, true);
            expect(service['areaNotFound']).toEqual([3]);
        });

        it('should call quickPlay', () => {
            service['handleAreaFoundInOriginal']([], false);
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        });

        it('should call flashArea', () => {
            service['handleAreaFoundInOriginal']([], false);
            expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        });

        it('should call reset canvas', () => {
            service['handleAreaFoundInOriginal']([], false);
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleAreaNotFoundInOriginal', () => {
        const mockCanvas = document.createElement('canvas');
        let audioSpy: jasmine.Spy;

        beforeEach(() => {
            audioSpy = spyOn(AudioService, 'quickPlay');
            spyOn(service['diffPlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
        });

        it('should call quickPlay', () => {
            service['handleAreaNotFoundInOriginal']();
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });

        it('should call drawError', () => {
            service['handleAreaNotFoundInOriginal']();
            expect(drawServiceSpy.drawError).toHaveBeenCalledTimes(1);
        });
    });

    it('startCheatMode should make the appropriate function calls ', fakeAsync(() => {
        const data = [1, 2, 3];
        service['imagesData'] = [1, 2];
        const spy = spyOn(service, 'resetCanvas' as never);
        service.startCheatMode(data);
        tick(Constants.millisecondsQuarterOfSecond);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        expect(service['areaNotFound']).toEqual([3]);
        clearInterval(service['flashInterval']);
    }));

    it('stopCheatMode should clear the flash interval', fakeAsync(() => {
        service['areaNotFound'] = [1, 2, 3];
        service['flashInterval'] = setInterval(() => {
            // do nothing
        }, Constants.millisecondsInOneSecond);
        const spy = spyOn(window, 'clearInterval').and.callThrough();
        tick();
        service.stopCheatMode();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(service['areaNotFound']).toEqual([]);
    }));
});