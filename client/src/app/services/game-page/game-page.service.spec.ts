/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { DialogData } from '@app/interfaces/dialogs';
import { AudioService } from '@app/services/audio/audio.service';
import { DrawService } from '@app/services/draw/draw.service';
import { GamePageService } from '@app/services/game-page/game-page.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
import { VideoService } from '@app/services/video/video.service';
import { Constants } from '@common/constants';
import { GameData } from '@common/interfaces/game-data';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('GamePageService', () => {
    let service: GamePageService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandler>;
    let mouseServiceSpy: jasmine.SpyObj<MouseService>;
    let audioServiceSpy: jasmine.SpyObj<AudioService>;
    let playAreaComponentSpy: jasmine.SpyObj<PlayAreaComponent>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;
    let quickPlaySpy: jasmine.Spy;
    let videoServiceSpy = jasmine.createSpyObj('VideoService', ['addToVideoStack']);
    const popUpServiceSpy = jasmine.createSpyObj('PopUpServiceService', ['openDialog', 'dialogRef']);
    popUpServiceSpy.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    popUpServiceSpy.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const canvas = document.createElement('canvas');
    const nativeElementMock = { nativeElement: canvas };
    const gameData: GameData = {
        differencePixels: [],
        totalDifferences: 0,
        amountOfDifferencesFound: 0,
        amountOfDifferencesFoundSecondPlayer: 0,
    };

    beforeEach(() => {
        quickPlaySpy = spyOn(AudioService, 'quickPlay');
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getX', 'getY']);
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['play', 'create', 'reset']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['context', 'drawError', 'drawHintSection']);
        videoServiceSpy = jasmine.createSpyObj('VideoService', ['addToVideoStack']);
        playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', [
            'getCanvas',
            'drawPlayArea',
            'flashArea',
            'timeout',
            'deleteTempCanvas',
            'showHintSection',
            'getFlashingCopy',
        ]);

        playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        playAreaComponentSpy.timeout.and.returnValue(Promise.resolve());

        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: SocketHandler, useValue: socketHandlerSpy },
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: AudioService, useValue: audioServiceSpy },
                { provide: VideoService, useValue: videoServiceSpy },
                { provide: PlayAreaComponent, useValue: playAreaComponentSpy },
                { provide: DrawService, useValue: drawServiceSpy },
            ],
        });
        service = TestBed.inject(GamePageService);
        service.setPlayArea(playAreaComponentSpy, playAreaComponentSpy, playAreaComponentSpy);
        service['drawServiceDifference'] = drawServiceSpy;
        service['drawServiceOriginal'] = drawServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getter', () => {
        it('getImageData should return the correct value', () => {
            service['imagesData'] = [1];
            expect(service.getImageData).toEqual(service['imagesData']);
        });

        it('getAreaNotFound should return the correct value', () => {
            service['areaNotFound'] = [1];
            expect(service.getAreaNotFound).toEqual(service['areaNotFound']);
        });
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
            expect(service['differencePlayArea']).toEqual(playArea);
            expect(service['tempDifferencePlayArea']).toEqual(playArea);
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
            // quickPlaySpy = spyOn(Audio.prototype, 'quickPlay');
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
        // quickPlaySpy = spyOn(Audio.prototype, 'quickPlay');
        it('should call create', () => {
            service.handleVictory(2, 1, '', '');
            expect(audioServiceSpy.create).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
            expect(audioServiceSpy.play).toHaveBeenCalled();
        });

        it('should call openDialog without adding the highscore position', () => {
            service.handleVictory(null, 1, '', '');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });

        it('should call openDialog when player is in first place', () => {
            service.handleVictory(1, 1, '', '');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });

        it('should call openDialog when player is in first place', () => {
            service.handleVictory(2, 1, '', '');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });
    });

    describe('setMouseCanClick', () => {
        it('should set mouseCanClick', () => {
            service.setMouseCanClick(true);
            expect(service['mouseService'].canClick).toEqual(true);
            service.setMouseCanClick(false);
            expect(service['mouseService'].canClick).toEqual(false);
        });
    });

    describe('handleOpponentAbandon', () => {
        // quickPlaySpy = spyOn(Audio.prototype, 'quickPlay');
        it('should call create', () => {
            service.handleOpponentAbandon();
            expect(audioServiceSpy.create).toHaveBeenCalledOnceWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
            expect(audioServiceSpy.play).toHaveBeenCalledOnceWith();
        });

        it('should call openDialog', () => {
            service.handleOpponentAbandon();
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });
    });

    describe('handleDefeat', () => {
        // quickPlaySpy = spyOn(Audio.prototype, 'quickPlay');
        it('should call create', () => {
            service.handleDefeat(1, '', '');
            expect(quickPlaySpy).toHaveBeenCalledWith('./assets/audio/LossSound.mp3');
        });

        it('should call openDialog', () => {
            service.handleDefeat(1, '', '');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalled();
        });
    });

    describe('preventJoining', () => {
        it('should call navigate', () => {
            service.preventJoining();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    describe('handleHintRequest', () => {
        const mockCanvas = document.createElement('canvas');
        it('should call drawHintSection on both canvas', fakeAsync(() => {
            const getCanvasSpy = spyOn(playAreaComponentSpy.getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
            const mockSection = [1];
            service.handleHintRequest(mockSection);
            tick();
            expect(getCanvasSpy).toHaveBeenCalledTimes(2);
            expect(drawServiceSpy.drawHintSection).toHaveBeenCalledTimes(2);
            expect(drawServiceSpy.drawHintSection).toHaveBeenCalledWith(mockSection);
            expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
        }));

        it('should not make calls if section is empty', () => {
            const getCanvasSpy = spyOn(playAreaComponentSpy.getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
            const mockSection = [] as number[];
            service.handleHintRequest(mockSection);
            expect(getCanvasSpy).not.toHaveBeenCalled();
            expect(drawServiceSpy.drawHintSection).not.toHaveBeenCalled();
            expect(drawServiceSpy.drawHintSection).not.toHaveBeenCalled();
        });
    });

    describe('handleHintShapeRequest', () => {
        it('should call the appropriate functions', () => {
            const mockCanvas = document.createElement('canvas');
            const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
            const mockSection = [0, 2, 2];
            service.handleHintShapeRequest(mockSection, mockCanvas);
            expect(fillRectSpy).toHaveBeenCalledTimes(1);
        });

        it('should not call anything if the size of the shape array is lower than 2', () => {
            const mockCanvas = document.createElement('canvas');
            const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
            const mockSection = [0, 0];
            service.handleHintShapeRequest(mockSection, mockCanvas);
            expect(fillRectSpy).not.toHaveBeenCalled();
        });
    });

    describe('pick', () => {
        it('should return undefined when context is undefined when copying', () => {
            const area = [0];
            spyOn(service['differencePlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(null);
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
        // quickPlaySpy = spyOn(Audio.prototype, 'quickPlay');
        it('should call handleAreaFoundInDifference if the area clicked was the difference canvas and a difference was found ', () => {
            const spy = spyOn(service, 'handleAreaFoundInDifference' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            const returnValue = service.handleResponse(false, gameData, false, 0, 0);
            expect(spy).toHaveBeenCalled();
            expect(returnValue).toEqual(true);
        });

        it('should call handleAreaNotFoundInDifference if the area clicked was the difference canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInDifference' as never);
            const returnValue = service.handleResponse(false, gameData, false, 0, 0);
            expect(spy).toHaveBeenCalled();
            expect(returnValue).toEqual(false);
        });

        it('should call handleAreaFoundInOriginal and return true if clicked on original canvas and a difference was found', () => {
            const spy = spyOn(service, 'handleAreaFoundInOriginal' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            const returnValue = service.handleResponse(false, gameData, true, 0, 0);
            expect(spy).toHaveBeenCalled();
            expect(returnValue).toEqual(true);
        });

        it('should call handleAreaNotFoundInOriginal and return false if clicked on original canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInOriginal' as never);
            const returnValue = service.handleResponse(false, gameData, true, 0, 0);
            expect(spy).toHaveBeenCalled();
            expect(returnValue).toEqual(false);
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
        const delay = 1000;
        let copyAreaSpy: jasmine.Spy;
        let copyDiffCtxSpy: jasmine.Spy;
        let handleHintRequestSpy: jasmine.Spy;

        beforeEach(() => {
            copyAreaSpy = spyOn(service, 'copyArea' as never);
            copyDiffCtxSpy = spyOn(service, 'copyDiffPlayAreaContext' as never);
            handleHintRequestSpy = spyOn(service, 'handleHintRequest' as never);
            service['resetCanvasDelayInProgress'] = false;
        });

        it('should call drawPlayArea twice', fakeAsync(() => {
            spyOn(service, 'addToVideoStack' as never);
            service['resetCanvas'](false);
            tick(delay);
            expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
        }));

        it('should call deleteTempCanvas twice', fakeAsync(() => {
            service['resetCanvas'](false);
            tick(delay);
            expect(playAreaComponentSpy.deleteTempCanvas).toHaveBeenCalledTimes(2);
        }));

        it('should set back canClick to true after delay is cooldown is true', fakeAsync(() => {
            service['resetCanvas'](true);
            expect(mouseServiceSpy['canClick']).toBeFalse();
            tick(delay);
            expect(mouseServiceSpy['canClick']).toBeTrue();
        }));

        it('should call copyArea, copyDiffPlayAreaContext and handleHintRequest', fakeAsync(() => {
            service['resetCanvas'](true);
            tick(delay);
            expect(copyAreaSpy).toHaveBeenCalledTimes(1);
            expect(copyDiffCtxSpy).toHaveBeenCalledTimes(1);
            expect(handleHintRequestSpy).toHaveBeenCalledTimes(1);
        }));

        it('should not make calls if cooldown and resetCanvasDelayInProgress are true', fakeAsync(() => {
            service['resetCanvasDelayInProgress'] = true;
            service['resetCanvas'](true);
            tick(delay);
            expect(copyAreaSpy).not.toHaveBeenCalled();
            expect(copyDiffCtxSpy).not.toHaveBeenCalled();
            expect(handleHintRequestSpy).not.toHaveBeenCalled();
        }));
    });

    describe('handleAreaFoundInDifference', () => {
        let resetCanvasSpy: jasmine.Spy;
        let flashBothCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            // quickPlaySpy = spyOn(AudioService, 'quickPlay' as never);
            flashBothCanvasSpy = spyOn(service, 'flashBothCanvas' as never).and.resolveTo();
            spyOn(service, 'addToVideoStack' as never);
            playAreaComponentSpy.getFlashingCopy.and.returnValue(document.createElement('canvas'));
        });

        it('should push the difference array correctly in imagesData', fakeAsync(async () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInDifference'](expectedArray, false, 0, 0);
            await flashBothCanvasSpy;
            expect(service['imagesData']).toEqual(expectedArray);
        }));

        it('should correctly filter areaNotFound in handleAreaFoundInDifference', fakeAsync(async () => {
            service['areaNotFound'] = [0, 1, 2, 3];
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInDifference'](expectedArray, true, 0, 0);
            await flashBothCanvasSpy;
            expect(service['areaNotFound']).toEqual([3]);
        }));

        it('should call quickPlay', fakeAsync(async () => {
            service['handleAreaFoundInDifference']([], false, 0, 0);
            expect(quickPlaySpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        }));

        it('should call getFlashingCopy', fakeAsync(async () => {
            service['handleAreaFoundInDifference']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(playAreaComponentSpy.getFlashingCopy).toHaveBeenCalledTimes(2);
        }));

        it('should call addToVideoStack', fakeAsync(async () => {
            service['handleAreaFoundInDifference']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(service['addToVideoStack']).toHaveBeenCalledTimes(1);
        }));

        // fit('should call flashArea', fakeAsync(async () => {
        //     service['handleAreaFoundInDifference']([], false, 0, 0);
        //     await flashBothCanvasSpy;
        //     expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(0);
        // }));

        it('should call reset canvas', fakeAsync(async () => {
            service['handleAreaFoundInDifference']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        }));

        it('should set hintSection to empty array', () => {
            service['hintSection'] = [0, 1, 2, 3];
            service['handleAreaFoundInDifference']([], false, 0, 0);
            expect(service['hintSection']).toEqual([]);
        });
    });

    describe('copyDiffPlayAreaContext', () => {
        it('should call the appropriate functions', () => {
            const mockCanvas = document.createElement('canvas');
            const getCanvasSpy = spyOn(playAreaComponentSpy.getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
            const getImgDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'getImageData');
            const putImgDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'putImageData');
            service['copyDiffPlayAreaContext']();
            expect(getCanvasSpy).toHaveBeenCalledTimes(2);
            expect(getImgDataSpy).toHaveBeenCalledTimes(1);
            expect(putImgDataSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleAreaNotFoundInDifference', () => {
        const mockCanvas = document.createElement('canvas');
        let resetCanvasSpy: jasmine.Spy;
        let addToVideoStackSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            spyOn(service['differencePlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
            addToVideoStackSpy = spyOn(service, 'addToVideoStack' as never);
            spyOn(service, 'flashBothCanvas' as never).and.resolveTo();
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        });

        it('should call quickPlay', () => {
            service['handleAreaNotFoundInDifference']();
            expect(quickPlaySpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });

        it('should call drawError', () => {
            service['handleAreaNotFoundInDifference']();
            expect(drawServiceSpy.drawError).toHaveBeenCalledTimes(1);
        });

        it('should call addToVideoStack', () => {
            service['handleAreaNotFoundInDifference']();
            expect(addToVideoStackSpy).toHaveBeenCalledTimes(1);
        });

        it('should call reset canvas', () => {
            service['handleAreaNotFoundInDifference']();
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('handleAreaFoundInOriginal', () => {
        let resetCanvasSpy: jasmine.Spy;
        let flashBothCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            flashBothCanvasSpy = spyOn(service, 'flashBothCanvas' as never).and.resolveTo();
            spyOn(service, 'addToVideoStack' as never);
            playAreaComponentSpy.getFlashingCopy.and.returnValue(document.createElement('canvas'));
        });

        it('should push the difference array correctly in imagesData', fakeAsync(async () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInOriginal'](expectedArray, false, 0, 0);
            await flashBothCanvasSpy;
            expect(service['imagesData']).toEqual(expectedArray);
        }));

        it('should call addToVideoStack', fakeAsync(async () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInOriginal'](expectedArray, false, 0, 0);
            await flashBothCanvasSpy;
            expect(service['addToVideoStack']).toHaveBeenCalledTimes(1);
        }));

        it('should call getFlashingCopy', fakeAsync(async () => {
            const expectedArray = [0, 1, 2];
            service['handleAreaFoundInOriginal'](expectedArray, false, 0, 0);
            await flashBothCanvasSpy;
            expect(playAreaComponentSpy.getFlashingCopy).toHaveBeenCalledTimes(2);
        }));

        it('should correctly filter areaNotFound in handleAreaFoundInOriginal', fakeAsync(async () => {
            const expectedArray = [0, 1, 2];
            service['areaNotFound'] = [0, 1, 2, 3];
            service['handleAreaFoundInOriginal'](expectedArray, true, 0, 0);
            await flashBothCanvasSpy;
            expect(service['areaNotFound']).toEqual([3]);
        }));

        it('should call quickPlay', fakeAsync(async () => {
            service['handleAreaFoundInOriginal']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(quickPlaySpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        }));

        it('should call reset canvas', fakeAsync(async () => {
            service['handleAreaFoundInOriginal']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        }));

        it('should set hintSection to empty array', () => {
            service['hintSection'] = [0, 1, 2, 3];
            service['handleAreaFoundInOriginal']([], false, 0, 0);
            expect(service['hintSection']).toEqual([]);
        });
    });

    describe('handleAreaNotFoundInOriginal', () => {
        let resetCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            playAreaComponentSpy.getFlashingCopy.and.returnValue(document.createElement('canvas'));
            spyOn(service, 'addToVideoStack' as never);
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        });

        it('should call quickPlay', () => {
            service['handleAreaNotFoundInOriginal']();
            expect(quickPlaySpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
        });

        it('should call drawError', () => {
            service['handleAreaNotFoundInOriginal']();
            expect(drawServiceSpy.drawError).toHaveBeenCalledTimes(1);
        });

        it('should call reset canvas', () => {
            service['handleAreaNotFoundInOriginal']();
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('startCheatMode', () => {
        let resetCanvasSpy: jasmine.Spy;
        let addToVideoStackSpy: jasmine.Spy;

        beforeEach(() => {
            jasmine.clock().install();
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            addToVideoStackSpy = spyOn(service, 'addToVideoStack' as never);
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
            playAreaComponentSpy.getFlashingCopy.and.returnValue(document.createElement('canvas'));
        });

        afterEach(() => {
            jasmine.clock().uninstall();
            clearInterval(service['flashInterval']);
        });

        it('should call resetCanvas method', () => {
            service.startCheatMode([1, 2, 3], 0, 0);
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToVideoStack method', () => {
            service.startCheatMode([1, 2, 3], 0, 0);
            expect(addToVideoStackSpy).toHaveBeenCalled();
        });

        it('should make the appropriate function calls', fakeAsync(() => {
            service.startCheatMode([1, 2, 3], 0, 0);

            jasmine.clock().tick(Constants.CHEAT_FLASHING_DELAY);
            expect(playAreaComponentSpy.flashArea).toHaveBeenCalled();

            expect(playAreaComponentSpy.getFlashingCopy).toHaveBeenCalledTimes(2);
            expect(service['addToVideoStack']).toHaveBeenCalledTimes(2);

            jasmine.clock().tick(Constants.CHEAT_FLASHING_DELAY);
            expect(playAreaComponentSpy.deleteTempCanvas).toHaveBeenCalledTimes(2);
            clearInterval(service['flashInterval']);
        }));
    });

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

    describe('handleTimedModeFinished', () => {
        const timedGameFinishedDialogData: DialogData = {
            textToSend: '',
            closeButtonMessage: 'Retour au menu principal',
            mustProcess: false,
        };

        it('should play the appropriate sound', () => {
            service.handleTimedModeFinished(true);
            expect(audioServiceSpy.create).toHaveBeenCalledOnceWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
            expect(audioServiceSpy.play).toHaveBeenCalled();
        });

        it('should open specific dialog if finishedWithLastLevel is true', () => {
            timedGameFinishedDialogData.textToSend = 'La partie est terminée! Vous avez terminé le dernier niveau du mode à temps limité.';
            service.handleTimedModeFinished(true);
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(timedGameFinishedDialogData, '/home');
        });

        it('should open specific dialog if finishedWithLastLevel is false', () => {
            timedGameFinishedDialogData.textToSend = 'La partie est terminée! Le temps est écoulé.';
            service.handleTimedModeFinished(false);
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(timedGameFinishedDialogData, '/home');
        });
    });

    describe('addToVideoStack', () => {
        it('should call VideoService.addToVideoStack if original && difference are defined', () => {
            const mockOriginalCanvas = document.createElement('canvas');
            const spy = spyOn(VideoService, 'addToVideoStack');
            const mockContext = mockOriginalCanvas.getContext('2d');
            service['addToVideoStack'](false, 0, 0, mockContext, mockContext);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call VideoService.addToVideoStack if original && difference are null', () => {
            const spy = spyOn(VideoService, 'addToVideoStack');
            service['addToVideoStack']();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    it('copyDiffPlayAreaContext should copy tempDifferencePlayArea context to differencePlayArea context', () => {
        const getImgDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'getImageData');
        const putImgDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'putImageData');
        service['copyDiffPlayAreaContext']();
        expect(playAreaComponentSpy.getCanvas).toHaveBeenCalledTimes(2);
        expect(putImgDataSpy).toHaveBeenCalledTimes(1);
        expect(getImgDataSpy).toHaveBeenCalledTimes(1);
    });

    it('flashBothCanvas should call flashArea on both playAreaComponent', fakeAsync(() => {
        service['flashBothCanvas']([1]);
        tick(Constants.CHEAT_FLASHING_DELAY);
        expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
    }));

    describe('playSuccessSound', () => {
        it('should play the appropriate sound', () => {
            service.playSuccessSound();
            expect(quickPlaySpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        });
    });
});
