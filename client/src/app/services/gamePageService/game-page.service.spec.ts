import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AudioService } from '@app/services/audioService/audio.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { SocketHandler } from '@app/services/socketHandlerService/socket-handler.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/game-data';
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
            service.handleResponse(true, gameData, false);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaNotFoundInDiff if the area clicked was the difference canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInDiff' as never);
            service.handleResponse(false, gameData, false);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
            const spy = spyOn(service, 'handleAreaFoundInOriginal' as never);
            service.handleResponse(true, gameData, true);
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
        it('should refresh the area and copy a part of the original canvas', fakeAsync(() => {
            service['resetCanvas']();
            tick(Constants.millisecondsInOneSecond);
            expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
        }));
    });

    describe('handleAreaFoundInDiff', () => {
        it('should call multiple functions', () => {
            const result = [1, 2, 3];
            const audioSpy = spyOn(AudioService, 'quickPlay');
            service['handleAreaFoundInDiff'](result);
            expect(service['imagesData']).toEqual(result);
            service['imagesData'] = [];
            expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        });
    });

    describe('handleAreaNotFoundInDiff', () => {
        it('should call quickPlay', () => {
            const audioSpy = spyOn(AudioService, 'quickPlay');
            service['handleAreaNotFoundInDiff']();
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });
    });

    describe('handleAreaFoundInOriginal', () => {
        it('should call multiple functions', () => {
            const result = [1, 2, 3];
            const audioSpy = spyOn(AudioService, 'quickPlay');
            service['handleAreaFoundInOriginal'](result);
            expect(service['imagesData']).toEqual(result);
            service['imagesData'] = [];
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
            expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        });
    });

    describe('handleAreaNotFoundInOriginal', () => {
        it('should call quickPlay', () => {
            const audioSpy = spyOn(AudioService, 'quickPlay');
            spyOn(service, 'pick' as never);
            service['handleAreaNotFoundInOriginal']();
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });
    });
});
