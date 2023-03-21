/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { RouterTestingModule } from '@angular/router/testing';
import { LevelDifferences } from '@app/classes/difference';
import { AppMaterialModule } from '@app/modules/material.module';
import { CanvasSharingService } from '@app/services/canvasSharingService/canvas-sharing.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { DifferenceDetectorService } from '@app/services/differenceDetectorService/difference-detector.service';
import { DrawService } from '@app/services/drawService/draw.service';
import { MouseService } from '@app/services/mouseService/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import { CreationPageService } from './creation-page.service';
import SpyObj = jasmine.SpyObj;

describe('CreationPageService', () => {
    let service: CreationPageService;
    let diffServiceSpy: SpyObj<DifferenceDetectorService>;
    let communicationSpy: SpyObj<CommunicationService>;
    let popUpServiceSpy: any;
    let drawServiceDefaultSpy: SpyObj<DrawService>;
    let drawServiceDiffSpy: SpyObj<DrawService>;
    let mouseServiceSpy: SpyObj<MouseService>;

    beforeEach(() => {
        diffServiceSpy = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences']);
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['postLevel']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog', 'dialogRef']);
        popUpServiceSpy.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        popUpServiceSpy.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));
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
                { provide: DifferenceDetectorService, useValue: diffServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: CommunicationService, useValue: communicationSpy },
                { provide: DrawService, useValue: drawServiceDefaultSpy },
                { provide: DrawService, useValue: drawServiceDiffSpy },
                { provide: MouseService, useValue: mouseServiceSpy },
            ],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        });
        service = TestBed.inject(CreationPageService);
        drawServiceDefaultSpy = (service as any).drawServiceDefault;
        drawServiceDiffSpy = (service as any).drawServiceDiff;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('constructor should correctly initialize', fakeAsync(() => {
        spyOn<any>(service, 'getEmptyBMPFile').and.returnValue(Promise.resolve(new File([''], '')));
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
        const creationService = new CreationPageService(
            new CanvasSharingService(),
            diffServiceSpy,
            popUpServiceSpy,
            communicationSpy,
            mouseServiceSpy,
            mouseServiceSpy,
        );
        expect(creationService['canvasShare'].defaultCanvas).toBeUndefined();
        expect(creationService['canvasShare'].diffCanvas).toBeUndefined();
        expect(service['submitFunction']('')).toBeFalse();
        expect(service['submitFunction']('A title')).toBeTrue();
        expect(service['submitFunction']('A really long game name that should not be accepted as it breaks the UI')).toBeFalse();
        tick();
        expect(service['creationSpecs'].defaultImageFile).toEqual(new File([''], ''));
        expect(service['creationSpecs'].diffImageFile).toEqual(new File([''], ''));
    }));

    it('defaultImageSelector should make the appropriate function calls', fakeAsync(() => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const verifyImageFormatSpy = spyOn<any>(service, 'verifyImageFormat').and.resolveTo(true);
        const showDefaultImageSpy = spyOn<any>(service, 'showDefaultImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(verifyImageFormatSpy).toHaveBeenCalledTimes(1);
        expect(showDefaultImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('defaultImageSelector should initialize defaultImageFile with the file given as parameter', fakeAsync(() => {
        spyOn<any>(service, 'restartGame');
        spyOn<any>(service, 'verifyImageFormat').and.resolveTo(true);
        spyOn<any>(service, 'showDefaultImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(service['creationSpecs'].defaultImageFile).toEqual(mockFile);
    }));

    it('defaultImageSelector should not call showDefaultImage if verifyImageFormat returned false', fakeAsync(() => {
        spyOn<any>(service, 'restartGame');
        spyOn<any>(service, 'verifyImageFormat').and.resolveTo(false);
        const showDefaultImageSpy = spyOn<any>(service, 'showDefaultImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.defaultImageSelector(mockEvent);
        tick();
        expect(showDefaultImageSpy).not.toHaveBeenCalled();
    }));

    it('diffImageSelector should make the appropriate function calls', fakeAsync(() => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const verifyImageFormatSpy = spyOn<any>(service, 'verifyImageFormat').and.resolveTo(true);
        const showDiffImageSpy = spyOn<any>(service, 'showDiffImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(verifyImageFormatSpy).toHaveBeenCalledTimes(1);
        expect(showDiffImageSpy).toHaveBeenCalledTimes(1);
    }));

    it('diffImageSelector should initialize diffImageFile with the file given as parameter', fakeAsync(() => {
        spyOn<any>(service, 'restartGame');
        spyOn<any>(service, 'verifyImageFormat').and.resolveTo(true);
        spyOn<any>(service, 'showDiffImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(service['creationSpecs'].diffImageFile).toEqual(mockFile);
    }));

    it('diffImageSelector should not call showDefaultImage if verifyImageFormat returned false', fakeAsync(() => {
        spyOn<any>(service, 'restartGame');
        spyOn<any>(service, 'verifyImageFormat').and.resolveTo(false);
        const showDiffImageSpy = spyOn<any>(service, 'showDiffImage');
        const mockFile = new File([''], 'mock.bmp');
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        service.diffImageSelector(mockEvent);
        tick();
        expect(showDiffImageSpy).not.toHaveBeenCalled();
    }));

    it('both image selector should call diffImageSelector and defaultImageSelector', fakeAsync(() => {
        const defaultImageSelectorSpy = spyOn<any>(service, 'defaultImageSelector');
        const diffImageSelectorSpy = spyOn<any>(service, 'diffImageSelector');
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
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const defaultCanvasSpy = spyOnProperty(service['canvasShare'], 'defaultCanvas').and.callThrough();
        service.resetDefaultBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDefault should call restartGame and not clearRect from defaultCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].defaultCanvas, 'getContext').and.returnValue(null);
        service.resetDefaultBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalledTimes(1);
    });

    it('resetDiff should call restartGame and clearRect from diffCanvas', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const defaultCanvasSpy = spyOnProperty(service['canvasShare'], 'diffCanvas').and.callThrough();
        service.resetDiffBackground();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDiff should call restartGame and not clearRect from diffCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].diffCanvas, 'getContext').and.returnValue(null);
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
        const mockEvent = { value: Constants.thirty };
        const defaultDrawSpy = spyOn(drawServiceDefaultSpy, 'setBrushSize');
        const diffDrawSpy = spyOn(drawServiceDiffSpy, 'setBrushSize');
        const defaultCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        service.brushSliderChange(mockEvent, defaultCanvasCtx, diffCanvasCtx);
        // expect(drawServiceDefaultSpy.setBrushSize).toHaveBeenCalledWith(Constants.thirty);
        // expect(drawServiceDiffSpy.setBrushSize).toHaveBeenCalledWith(Constants.thirty);
        expect(defaultDrawSpy).toHaveBeenCalledOnceWith(Constants.thirty);
        expect(diffDrawSpy).toHaveBeenCalledWith(Constants.thirty);
    });

    it('detectDifference should not call errorDialog if none of the canvases are null and call DifferenceService detectDifferences', () => {
        const defaultBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        const errorDialogSpy = spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
        ];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasCtx, diffBgCanvasCtx);

        expect(errorDialogSpy).not.toHaveBeenCalled();
        expect(diffServiceSpy.detectDifferences).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call errorDialog if DifferenceService detectDifferences returned no LevelDifference', () => {
        const defaultBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const errorDialogSpy = spyOn<any>(service, 'errorDialog');

        diffServiceSpy.detectDifferences.and.returnValue(undefined);

        service.detectDifference(defaultBgCanvasCtx, diffBgCanvasCtx);

        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    });

    it('detectDifference correctly set the number of differences and isSaveable', () => {
        const defaultBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [
            [1, 1, 1],
            [2, 2, 2],
            [3, 3, 3],
        ];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasCtx, diffBgCanvasCtx);

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).toBeTrue();
    });

    it('detectDifference correctly set the number of differences, isSaveable and differenceAmountMsg', () => {
        const defaultBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1, 1, 1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(defaultBgCanvasCtx, diffBgCanvasCtx);

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMsg']).toEqual(' (Attention, le nombre de différences est trop bas)');

        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]];
        service.detectDifference(defaultBgCanvasCtx, diffBgCanvasCtx);
        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMsg']).toEqual(' (Attention, le nombre de différences est trop élevé)');
    });

    it('detectDifference should call openDialog if the game is not saveable', () => {
        const defaultBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffBgCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(diffBgCanvasCtx, defaultBgCanvasCtx);

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call openDialog if the game is saveable', () => {
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference(mockLevelDifference.canvas, mockLevelDifference.canvas);

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('save game should call open dialog twice if we can save and post level was successful', () => {
        service['isSaveable'] = true;
        (service as any).defaultUploadFile = new File([], 'test1');
        (service as any).diffUploadFile = new File([], 'test2');
        popUpServiceSpy.openDialog.and.returnValue({
            afterClosed: () =>
                of({
                    hasAccepted: 'Hello World',
                }),
        });
        communicationSpy.postLevel.and.returnValue(
            of({
                title: 'success',
                body: 'it was a sucess',
            }),
        );
        service.saveGame();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(2);
    });

    it('save game should call open dialog once if we can save and post level was not successful', () => {
        service['isSaveable'] = true;
        (service as any).defaultUploadFile = new File([], 'test1');
        (service as any).diffUploadFile = new File([], 'test2');
        const errorDialogSpy = spyOn<any>(service, 'errorDialog');
        popUpServiceSpy.openDialog.and.returnValue({
            afterClosed: () =>
                of({
                    hasAccepted: 'Hello World',
                }),
        });
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
        const defaultCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const defaultDrawSpy = spyOn(drawServiceDefaultSpy, 'paintBrush');
        const diffDrawSpy = spyOn(drawServiceDiffSpy, 'paintBrush');
        service.paintBrushMode(defaultCanvasCtx, diffCanvasCtx);
        expect(mouseServiceSpy.isRectangleMode).toBeFalse();

        expect(defaultDrawSpy).toHaveBeenCalledTimes(1);
        expect(diffDrawSpy).toHaveBeenCalledTimes(1);
    });

    it('eraseBrushMode should call the correct draw functions', () => {
        const defaultCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const diffCanvasCtx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        const defaultDrawSpy = spyOn(drawServiceDefaultSpy, 'eraseBrush');
        const diffDrawSpy = spyOn(drawServiceDiffSpy, 'eraseBrush');
        service.eraseBrushMode(defaultCanvasCtx, diffCanvasCtx);
        expect(mouseServiceSpy.isRectangleMode).toBeFalse();

        expect(defaultDrawSpy).toHaveBeenCalledTimes(1);
        expect(diffDrawSpy).toHaveBeenCalledTimes(1);
    });

    it('rectangleMode should set isRectangleMode to true', () => {
        service.rectangleMode();
        expect(mouseServiceSpy.isRectangleMode).toBeTrue();
    });

    it('colorPickerMode should call the correct draw functions', () => {
        const defaultDrawSpy = spyOn(drawServiceDefaultSpy, 'setPaintColor');
        const diffDrawSpy = spyOn(drawServiceDiffSpy, 'setPaintColor');
        service.colorPickerMode();
        expect(defaultDrawSpy).toHaveBeenCalledTimes(1);
        expect(diffDrawSpy).toHaveBeenCalledTimes(1);
    });

    it('getEmptyBMPFile should return a new File with the correct src', fakeAsync(async () => {
        const result = await service['getEmptyBMPFile']();
        expect(result.name).toEqual('image_empty.bmp');
    }));

    it('verifyImageFormat should call error dialog if the image is not in the image/bmp format', fakeAsync(async () => {
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        const result: boolean = await service['verifyImageFormat'](new File([''], '', { type: 'image/jpeg' }));
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
        expect(result).toBeFalse();
    }));

    it('verifyImageFormat should call error dialog if the image is not 24 bits per pixels', fakeAsync(async () => {
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
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
        service['errorDialog']();
        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage showDefaultImage should call errorDialog if defaultCanvasCtx is undefined', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload']);
        spyOn(window, 'Image').and.returnValue(imageSpy);

        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['creationSpecs'].defaultBgCanvasCtx = null;
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should call errorDialog if image is not correct width', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 0, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should call errorDialog if image is not correct height', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 0 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['showDefaultImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDefaultImage should correctly update class attributes', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        spyOn(service, 'errorDialog' as never);
        service['showDefaultImage']();
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

        imageSpy.onload();
        expect(service['canvasShare'].defaultCanvas.width).toEqual(Constants.DEFAULT_WIDTH);
        expect(service['canvasShare'].defaultCanvas.height).toEqual(Constants.DEFAULT_HEIGHT);
    }));

    it('showDiffImage should call errorDialog if diffCanvasCtx is undefined', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload']);
        spyOn(window, 'Image').and.returnValue(imageSpy);

        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['creationSpecs'].diffBgCanvasCtx = null;
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should call errorDialog if image is not correct width', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 0, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should call errorDialog if image is not correct height', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 0 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        const errorDialogSpy = spyOn(service, 'errorDialog' as never);
        service['showDiffImage']();

        imageSpy.onload();
        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    }));

    it('showDiffImage should correctly update class attributes', fakeAsync(() => {
        const imageSpy = jasmine.createSpyObj('Image', ['onload'], { width: 640, height: 480 });
        spyOn(window, 'Image').and.returnValue(imageSpy);
        spyOn(service, 'errorDialog' as never);
        service['showDiffImage']();
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage');

        imageSpy.onload();
        expect(service['canvasShare'].diffCanvas.width).toEqual(Constants.DEFAULT_WIDTH);
        expect(service['canvasShare'].diffCanvas.height).toEqual(Constants.DEFAULT_HEIGHT);
    }));

    it('getImg should return a blob of the canvas', async () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.fillRect(0, 0, Constants.RECTANGLE_SIZE, Constants.RECTANGLE_SIZE);
        const res = await service.toImgFile(context);
        expect(res instanceof Blob).toBe(true);
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

    it('get differenceMsg should return the correct value', fakeAsync(() => {
        service['differenceAmountMsg'] = '3 differences';
        const result = service.differenceMsg;
        expect(result).toEqual('3 differences');
    }));

    it('saveFalse should set isSave', fakeAsync(() => {
        service['isSaveable'] = true;
        service.saveFalse();
        expect(service['isSaveable']).toBeFalse();
    }));
});
