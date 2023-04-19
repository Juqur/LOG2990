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
import { DialogData, PopUpService } from '@app/services/pop-up/pop-up.service';
import { SocketHandler } from '@app/services/socket-handler/socket-handler.service';
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
        socketHandlerSpy = jasmine.createSpyObj('SocketHandler', ['send']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['getMousePosition', 'getX', 'getY']);
        audioServiceSpy = jasmine.createSpyObj('AudioService', ['play', 'create', 'reset']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['context', 'drawError']);
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
            expect(service['differencePlayArea']).toEqual(playArea);
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
            const audioSpy = spyOn(AudioService, 'quickPlay');
            service.handleVictory(1, '', '');
            expect(audioSpy).toHaveBeenCalledWith('./assets/audio/Bing_Chilling_vine_boom.mp3');
        });

        it('should call openDialog', () => {
            service.handleVictory(1, '', '');
            expect(popUpServiceSpy.openDialog).toHaveBeenCalledWith(service['winGameDialogData'], service['closePath']);
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
        it('should call create', () => {
            const audioSpy = spyOn(AudioService, 'quickPlay');
            service.handleDefeat(1, '', '');
            expect(audioSpy).toHaveBeenCalledWith('./assets/audio/LossSound.mp3');
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
        it('should call showHintSection on both canvas', () => {
            const mockSection = [1];
            service.handleHintRequest(mockSection);
            expect(playAreaComponentSpy.showHintSection).toHaveBeenCalledTimes(2);
            expect(playAreaComponentSpy.showHintSection).toHaveBeenCalledWith(mockSection);
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
        it('should call handleAreaFoundInDifference if the area clicked was the difference canvas and a difference was found ', () => {
            const spy = spyOn(service, 'handleAreaFoundInDifference' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            service.handleResponse(false, gameData, false, 0, 0);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaNotFoundInDifference if the area clicked was the difference canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInDifference' as never);
            service.handleResponse(false, gameData, false, 0, 0);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaFoundInOriginal if the area clicked was the original canvas and a difference was found', () => {
            const spy = spyOn(service, 'handleAreaFoundInOriginal' as never);
            spyOn(service, 'validateResponse').and.returnValue(true);
            service.handleResponse(false, gameData, true, 0, 0);
            expect(spy).toHaveBeenCalled();
        });

        it('should call handleAreaNotFoundInOriginal if the area clicked was the original canvas and a difference was not found', () => {
            const spy = spyOn(service, 'handleAreaNotFoundInOriginal' as never);
            service.handleResponse(false, gameData, true, 0, 0);
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
            spyOn(service, 'copyArea' as never);
            spyOn(service, 'copyDiffPlayAreaContext' as never);
            spyOn(service, 'addToVideoStack' as never);
            const delay = 1000;
            service['resetCanvas']();
            tick(delay);
            expect(playAreaComponentSpy.drawPlayArea).toHaveBeenCalledTimes(2);
        }));
    });

    describe('handleAreaFoundInDifference', () => {
        let resetCanvasSpy: jasmine.Spy;
        let audioSpy: jasmine.Spy;
        let flashBothCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
            flashBothCanvasSpy = spyOn(service, 'flashBothCanvas' as never).and.resolveTo();
            spyOn(service, 'addToVideoStack' as never);
            // playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
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
            await flashBothCanvasSpy;

            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
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

        it('should call reset canvas', fakeAsync(async () => {
            service['handleAreaFoundInDifference']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        }));

        // it('should push the difference array correctly in imagesData', () => {
        //     const expectedArray = [0, 1, 2];
        //     service['handleAreaFoundInDifference'](expectedArray, false, 0, 0);
        //     expect(service['imagesData']).toEqual(expectedArray);
        // });

        // it('should correctly filter areaNotFound in handleAreaFoundInDifference', () => {
        //     service['areaNotFound'] = [0, 1, 2, 3];
        //     const expectedArray = [0, 1, 2];
        //     service['handleAreaFoundInDifference'](expectedArray, true, 0, 0);
        //     expect(service['areaNotFound']).toEqual([3]);
        // });

        // it('should call getFlashingCopy', fakeAsync(() => {
        //     service['handleAreaFoundInDifference']([], false, 0, 0);
        //     tick();
        //     expect(playAreaComponentSpy.getFlashingCopy).toHaveBeenCalledTimes(2);
        // }));

        // it('should call addToVideoStack', fakeAsync(() => {
        //     service['handleAreaFoundInDifference']([], false, 0, 0);
        //     tick();
        //     expect(service['addToVideoStack']).toHaveBeenCalledTimes(1);
        // }));
    });

    describe('handleAreaNotFoundInDifference', () => {
        let resetCanvasSpy: jasmine.Spy;
        let addToVideoStackSpy: jasmine.Spy;
        let audioSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
            addToVideoStackSpy = spyOn(service, 'addToVideoStack' as never);
            spyOn(service, 'flashBothCanvas' as never).and.resolveTo();
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        });

        it('should call quickPlay', () => {
            service['handleAreaNotFoundInDifference']();
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/failed.mp3');
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
        let audioSpy: jasmine.Spy;
        let flashBothCanvasSpy: jasmine.Spy;

        beforeEach(() => {
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            audioSpy = spyOn(AudioService, 'quickPlay');
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
            expect(audioSpy).toHaveBeenCalledOnceWith('./assets/audio/success.mp3');
        }));

        it('should call reset canvas', fakeAsync(async () => {
            service['handleAreaFoundInOriginal']([], false, 0, 0);
            await flashBothCanvasSpy;
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('handleAreaNotFoundInOriginal', () => {
        // const mockCanvas = document.createElement('canvas');
        let audioSpy: jasmine.Spy;
        // this.addToVideoStack();
        // this.resetCanvas();

        beforeEach(() => {
            audioSpy = spyOn(AudioService, 'quickPlay');
            playAreaComponentSpy.getFlashingCopy.and.returnValue(document.createElement('canvas'));
            spyOn(service, 'addToVideoStack' as never);
            spyOn(service, 'resetCanvas' as never);
            // spyOn(service['differencePlayArea'].getCanvas().nativeElement, 'getContext').and.returnValue(mockCanvas.getContext('2d'));
            // spyOn(playAreaComponentSpy, 'getCanvas').and.returnValue(document.createElement('canvas'));
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
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

    describe('startCheatMode', () => {
        let resetCanvasSpy: jasmine.Spy;
        let addToVideoStackSpy: jasmine.Spy;

        beforeEach(() => {
            // service = new YourComponent();
            resetCanvasSpy = spyOn(service, 'resetCanvas' as never);
            addToVideoStackSpy = spyOn(service, 'addToVideoStack' as never);
            jasmine.clock().install();
            playAreaComponentSpy.getCanvas.and.returnValue(nativeElementMock as ElementRef<HTMLCanvasElement>);
        });

        afterEach(() => {
            clearInterval(service['flashInterval']);
            jasmine.clock().uninstall();
        });

        it('should call resetCanvas method', () => {
            service.startCheatMode([1, 2, 3], 0, 0);
            expect(resetCanvasSpy).toHaveBeenCalledTimes(1);
        });

        it('should call addToVideoStack method', () => {
            service.startCheatMode([1, 2, 3], 0, 0);
            expect(addToVideoStackSpy).toHaveBeenCalled();
        });

        // will fix later
        // it('should make the appropriate function calls', fakeAsync(() => {
        //     service.startCheatMode([1, 2, 3], 0, 0);

        //     jasmine.clock().tick(Constants.CHEAT_FLASHING_DELAY);
        //     expect(playAreaComponentSpy.flashArea).toHaveBeenCalledWith(service['areaNotFound']);

        //     jasmine.clock().tick(Constants.CHEAT_FLASHING_DELAY);
        //     expect(service['addToVideoStack']).toHaveBeenCalledWith(
        //         false,
        //         0,
        //         0,
        //         jasmine.any(CanvasRenderingContext2D),
        //         jasmine.any(CanvasRenderingContext2D),
        //     );
        //     expect(playAreaComponentSpy.deleteTempCanvas).toHaveBeenCalledTimes(2);
        //     expect(playAreaComponentSpy.getFlashingCopy).toHaveBeenCalledTimes(2);
        //     expect(playAreaComponentSpy.flashArea).toHaveBeenCalledTimes(2);
        // }));
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
            expect(audioServiceSpy.play).toHaveBeenCalledOnceWith();
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
});
