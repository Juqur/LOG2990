/* eslint-disable max-lines */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlider, MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { LevelDifferences } from '@app/classes/difference';
import { PopUpDialogComponent } from '@app/components/pop-up-dialog/pop-up-dialog.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasSharingService } from '@app/services/canvas-sharing/canvas-sharing.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { DifferenceDetectorService } from '@app/services/difference-detector/difference-detector.service';
import { DrawService } from '@app/services/draw/draw.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PopUpService } from '@app/services/pop-up/pop-up.service';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import { CreationPageService } from './creation-page.service';
import SpyObj = jasmine.SpyObj;

describe('CreationPageService', () => {
    let service: CreationPageService;
    let differenceServiceSpy: SpyObj<DifferenceDetectorService>;
    let communicationSpy: SpyObj<CommunicationService>;
    let popUpServiceSpy: SpyObj<PopUpService>;
    let drawServiceDefaultSpy: SpyObj<DrawService>;
    let drawServiceDiffSpy: SpyObj<DrawService>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let dialogRefSpy: SpyObj<MatDialogRef<PopUpDialogComponent>>;
    let errorDialogSpy: jasmine.Spy;

    beforeEach(() => {
        differenceServiceSpy = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences']);
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['postLevel']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog'], { dialogRef: dialogRefSpy });
        dialogRefSpy.afterClosed.and.returnValue(of({ hasAccepted: true }));
        drawServiceDefaultSpy = jasmine.createSpyObj('DrawService', ['setPaintColor', 'setBrushSize', 'paintBrush', 'eraseBrush']);
        drawServiceDiffSpy = jasmine.createSpyObj('DrawService', ['setPaintColor', 'setBrushSize', 'paintBrush', 'eraseBrush']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', [
            'mouseHitDetect',
            'processClick',
            'getDifferencesArray',
            'incrementCounter',
            'getDifferenceCounter',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CanvasSharingService,
                HttpClient,
                HttpHandler,
                { provide: DifferenceDetectorService, useValue: differenceServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: CommunicationService, useValue: communicationSpy },
                { provide: DrawService, useValue: drawServiceDefaultSpy },
                { provide: DrawService, useValue: drawServiceDiffSpy },
                { provide: MouseService, useValue: mouseServiceSpy },
            ],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        });
        service = TestBed.inject(CreationPageService);
        service['drawServiceDefault'] = drawServiceDefaultSpy;
        service['drawServiceDiff'] = drawServiceDiffSpy;
        errorDialogSpy = spyOn(service, 'errorDialog' as never);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('constructor should correctly initialize', fakeAsync(() => {
        spyOn(service, 'getEmptyBMPFile' as never).and.returnValue(Promise.resolve(new File([''], '')) as never);
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
        const creationService = new CreationPageService(
            new CanvasSharingService(),
            differenceServiceSpy,
            popUpServiceSpy,
            communicationSpy,
            mouseServiceSpy,
            mouseServiceSpy,
        );
        expect(creationService['canvasShare'].defaultCanvas).toBeUndefined();
        expect(creationService['canvasShare'].differenceCanvas).toBeUndefined();
        expect(service['submitFunction']('')).toBeFalse();
        expect(service['submitFunction']('A title')).toBeTrue();
        expect(service['submitFunction']('A really long game name that should not be accepted as it breaks the UI')).toBeFalse();
        tick();
        expect(service['creationSpecs'].defaultImageFile).toEqual(new File([''], ''));
        expect(service['creationSpecs'].diffImageFile).toEqual(new File([''], ''));
    }));

    it('defaultImageSelector should make the appropriate function calls', fakeAsync(() => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const verifyImageFormatSpy = spyOn(service, 'verifyImageFormat' as never).and.resolveTo(true as never);
        const showDefaultImageSpy = spyOn(service, 'showDefaultImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(verifyImageFormatSpy).toHaveBeenCalledTimes(1);
        expect(showDefaultImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('defaultImageSelector should initialize defaultImageFile with the file given as parameter', fakeAsync(() => {
        spyOn(service, 'restartGame' as never);
        spyOn(service, 'verifyImageFormat' as never).and.resolveTo(true as never);
        spyOn(service, 'showDefaultImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(service['creationSpecs'].defaultImageFile).toEqual(mockFile);
    }));

    it('defaultImageSelector should not call showDefaultImage if verifyImageFormat returned false', fakeAsync(() => {
        spyOn(service, 'restartGame' as never);
        spyOn(service, 'verifyImageFormat' as never).and.resolveTo(false as never);
        const showDefaultImageSpy = spyOn(service, 'showDefaultImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(showDefaultImageSpy).not.toHaveBeenCalled();
    }));

    it('diffImageSelector should make the appropriate function calls', fakeAsync(() => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const verifyImageFormatSpy = spyOn(service, 'verifyImageFormat' as never).and.resolveTo(true as never);
        const showDiffImageSpy = spyOn(service, 'showDiffImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(verifyImageFormatSpy).toHaveBeenCalledTimes(1);
        expect(showDiffImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('diffImageSelector should initialize diffImageFile with the file given as parameter', fakeAsync(() => {
        spyOn(service, 'restartGame' as never);
        spyOn(service, 'verifyImageFormat' as never).and.resolveTo(true as never);
        spyOn(service, 'showDiffImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(service['creationSpecs'].diffImageFile).toEqual(mockFile);
    }));

    it('diffImageSelector should not call showDefaultImage if verifyImageFormat returned false', fakeAsync(() => {
        spyOn(service, 'restartGame' as never);
        spyOn(service, 'verifyImageFormat' as never).and.resolveTo(false as never);
        const showDiffImageSpy = spyOn(service, 'showDiffImage' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(showDiffImageSpy).not.toHaveBeenCalled();
    }));

    it('both image selector should call diffImageSelector and defaultImageSelector', fakeAsync(() => {
        const defaultImageSelectorSpy = spyOn(service, 'defaultImageSelector' as never);
        const diffImageSelectorSpy = spyOn(service, 'diffImageSelector' as never);
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.bothImagesSelector(mockEvent);
        tick();
        expect(defaultImageSelectorSpy).toHaveBeenCalledTimes(1);
        expect(diffImageSelectorSpy).toHaveBeenCalledTimes(1);
    }));

    it('cleanSrc should empty the value of the input element.', () => {
        const element = document.createElement('input');
        element.value = 'Hello world';
        element.onclick = service.cleanSrc;
        element.click();
        expect(element.value).not.toEqual('Hello world');
        expect(element.value).toEqual('');
    });

    it('resetDefault should call restartGame and clearRect from defaultCanvas', () => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const defaultCanvasSpy = spyOnProperty(service['canvasShare'], 'defaultCanvas').and.callThrough();
        service.resetDefaultBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDefault should call restartGame and not clearRect from defaultCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].defaultCanvas, 'getContext').and.returnValue(null);
        service.resetDefaultBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalledTimes(1);
    });

    it('resetDiff should call restartGame and clearRect from differenceCanvas', () => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const defaultCanvasSpy = spyOnProperty(service['canvasShare'], 'differenceCanvas').and.callThrough();
        service.resetDiffBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDiff should call restartGame and not clearRect from differenceCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn(service, 'restartGame' as never);
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].differenceCanvas, 'getContext').and.returnValue(null);
        service.resetDiffBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalledTimes(1);
    });

    it('diffSlider change should correctly update the value of the radius', () => {
        service.diffSliderChange(0);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[0]);
        service.diffSliderChange(1);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[1]);
        service.diffSliderChange(2);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[2]);
        service.diffSliderChange(3);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[3]);
    });

    it('brushSlider change should correctly update the value of both draw services', () => {
        const mockEvent = { value: 1 } as MatSlider;
        const defaultCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const differenceCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        service.brushSliderChange(mockEvent, defaultCanvasContext, differenceCanvasContext);
        expect(drawServiceDefaultSpy.setBrushSize).toHaveBeenCalledOnceWith(1);
        expect(drawServiceDiffSpy.setBrushSize).toHaveBeenCalledWith(1);
    });

    it('detectDifference should not call errorDialog if none of the canvases are null and call DifferenceService detectDifferences', () => {
        const defaultBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
        ];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        differenceServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasContext, diffBgCanvasContext);

        expect(errorDialogSpy).not.toHaveBeenCalled();
        expect(differenceServiceSpy.detectDifferences).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call errorDialog if DifferenceService detectDifferences returned no LevelDifference', () => {
        const defaultBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        differenceServiceSpy.detectDifferences.and.returnValue(undefined);

        service.detectDifference(defaultBgCanvasContext, diffBgCanvasContext);

        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    });

    it('detectDifference correctly set the number of differences and isSaveable', () => {
        const defaultBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
        ];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        differenceServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasContext, diffBgCanvasContext);

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).toBeTrue();
    });

    it('detectDifference correctly set the number of differences, isSaveable and differenceAmountMessage', () => {
        const defaultBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1, 1, 1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        differenceServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasContext, diffBgCanvasContext);

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMessage']).toEqual(' (Attention, le nombre de différences est trop bas)');

        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]];
        service.detectDifference(defaultBgCanvasContext, diffBgCanvasContext);
        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMessage']).toEqual(' (Attention, le nombre de différences est trop élevé)');
    });

    it('detectDifference should call openDialog if the game is not saveable', () => {
        const defaultBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        differenceServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(diffBgCanvasContext, defaultBgCanvasContext);

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call openDialog if the game is saveable', () => {
        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        differenceServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(mockLevelDifference.canvas, mockLevelDifference.canvas);

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('save game should call open dialog twice if we can save and post level was successful', () => {
        service['isSaveable'] = true;
        service['defaultUploadFile'] = new File([], 'test1');
        service['diffUploadFile'] = new File([], 'test2');
        communicationSpy.postLevel.and.returnValue(
            of({
                title: 'success',
                body: 'it was a success',
            }),
        );
        service.saveGame();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(2);
    });

    it('save game should call open dialog once if we can save and post level was not successful', () => {
        service['isSaveable'] = true;
        service['defaultUploadFile'] = new File([], 'test1');
        service['diffUploadFile'] = new File([], 'test2');
        communicationSpy.postLevel.and.returnValue(
            of({
                title: 'error',
                body: 'it was a sucess',
            }),
        );
        service.saveGame();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    });

    it('paintBrushMode should should call the correct draw functions', () => {
        const defaultCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const differenceCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        service.paintBrushMode(defaultCanvasContext, differenceCanvasContext);

        expect(mouseServiceSpy.isRectangleMode).toBeFalse();
        expect(drawServiceDefaultSpy.paintBrush).toHaveBeenCalledTimes(1);
        expect(drawServiceDiffSpy.paintBrush).toHaveBeenCalledTimes(1);
    });

    it('eraseBrushMode should call the correct draw functions', () => {
        const defaultCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const differenceCanvasContext = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        service.eraseBrushMode(defaultCanvasContext, differenceCanvasContext);

        expect(mouseServiceSpy.isRectangleMode).toBeFalse();
        expect(drawServiceDefaultSpy.eraseBrush).toHaveBeenCalledTimes(1);
        expect(drawServiceDiffSpy.eraseBrush).toHaveBeenCalledTimes(1);
    });

    it('rectangleMode should set isRectangleMode to true', () => {
        service.rectangleMode();
        expect(drawServiceDefaultSpy.paintBrush).toHaveBeenCalledTimes(1);
        expect(drawServiceDiffSpy.paintBrush).toHaveBeenCalledTimes(1);
        expect(mouseServiceSpy.isRectangleMode).toBeTrue();
    });

    it('colorPickerMode should call the correct draw functions', () => {
        service.colorPickerMode();
        expect(drawServiceDefaultSpy.setPaintColor).toHaveBeenCalledTimes(1);
        expect(drawServiceDiffSpy.setPaintColor).toHaveBeenCalledTimes(1);
    });

    it('getEmptyBMPFile should return a new File with the correct src', fakeAsync(async () => {
        const result = await service['getEmptyBMPFile']();
        expect(result.name).toEqual('image_empty.bmp');
    }));

    it('verifyImageFormat should call error dialog if the image is not in the image/bmp format', fakeAsync(async () => {
        const result: boolean = await service['verifyImageFormat'](new File([''], '', { type: 'image/jpeg' }));
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
        expect(result).toBeFalse();
    }));

    it('verifyImageFormat should call error dialog if the image is not 24 bits per pixels', fakeAsync(async () => {
        spyOn(DataView.prototype, 'getUint16').and.returnValue(Constants.BMP_BPP + 1);
        const mockFileGetter = async () => {
            const imageSrc = './assets/images/image_empty.bmp';
            return fetch(imageSrc)
                .then(async (res) => res.blob())
                .then((blob) => {
                    return new File([blob], 'image_empty.bmp', { type: 'image/bmp' });
                });
        };
        const mockFile = await mockFileGetter();
        const result: boolean = await service['verifyImageFormat'](mockFile);
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
        expect(result).toBeFalse();
    }));

    it('verifyImageFormat should return true if the image format is image/bmp and there is 24 bits per pixels', fakeAsync(async () => {
        const mockFileGetter = async () => {
            const imageSrc = './assets/images/image_empty.bmp';
            return fetch(imageSrc)
                .then(async (res) => res.blob())
                .then((blob) => {
                    return new File([blob], 'image_empty.bmp', { type: 'image/bmp' });
                });
        };
        const mockFile = await mockFileGetter();
        const result: boolean = await service['verifyImageFormat'](mockFile);
        expect(result).toBeTrue();
    }));

    it('Restart game should correctly reset class attributes', fakeAsync(async () => {
        service['isSaveable'] = true;
        service['creationSpecs'].nbDifferences = 3;
        service['restartGame']();
        expect(service['isSaveable']).toBeFalse();
        expect(service['creationSpecs'].nbDifferences).toEqual(Constants.INIT_DIFF_NB);
    }));

    it('errorDialog should close the previous dialog if there is one', fakeAsync(async () => {
        errorDialogSpy.and.callThrough();
        service['errorDialog']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage showDefaultImage should call errorDialog if defaultCanvasContext is undefined', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload']);
        spyOn(window, 'Image').and.returnValue(imageSpy);

        service['creationSpecs'].defaultBgCanvasContext = null;
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should call errorDialog if image is not correct width', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 0, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should call errorDialog if image is not correct height', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 0 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should correctly update class attributes', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDefaultImage']();
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

        imageSpy.onload();
        expect(service['canvasShare'].defaultCanvas.width).toEqual(Constants.DEFAULT_WIDTH);
        expect(service['canvasShare'].defaultCanvas.height).toEqual(Constants.DEFAULT_HEIGHT);
    }));

    it('showDiffImage should call errorDialog if differenceCanvasContext is undefined', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload']);
        spyOn(window, 'Image').and.returnValue(imageSpy);

        service['creationSpecs'].diffBgCanvasContext = null;
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should call errorDialog if image is not correct width', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 0, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should call errorDialog if image is not correct height', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 0 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should correctly update class attributes', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        service['showDiffImage']();
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

        imageSpy.onload();
        expect(service['canvasShare'].differenceCanvas.width).toEqual(Constants.DEFAULT_WIDTH);
        expect(service['canvasShare'].differenceCanvas.height).toEqual(Constants.DEFAULT_HEIGHT);
    }));

    it('getImg should return a blob of the canvas', async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.fillRect(0, 0, Constants.RECTANGLE_SIZE, Constants.RECTANGLE_SIZE);
        const res = await service.toImgFile(context);
        expect(res).toBeInstanceOf(Blob);
    });

    it('get radius should return the correct radius', fakeAsync(() => {
        service['creationSpecs'].radius = 3;
        const result = service.radius;
        expect(result).toEqual(3);
    }));

    it('isSaveable should return the correct value', fakeAsync(() => {
        service['isSaveable'] = true;
        const result = service.saveable;
        expect(result).toEqual(true);
    }));

    it('get nbDifferences should return the correct value', fakeAsync(() => {
        service['creationSpecs'].nbDifferences = 3;
        const result = service.nbDifferences;
        expect(result).toEqual(3);
    }));

    it('get differenceMessage should return the correct value', fakeAsync(() => {
        service['differenceAmountMessage'] = '3 differences';
        const result = service.differenceMessage;
        expect(result).toEqual('3 differences');
    }));

    it('saveFalse should set isSave', fakeAsync(() => {
        service['isSaveable'] = true;
        service.saveFalse();
        expect(service['isSaveable']).toBeFalse();
    }));
});
