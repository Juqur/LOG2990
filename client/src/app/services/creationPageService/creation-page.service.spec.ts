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
import { DifferenceDetectorService } from '@app/services/difference-detector.service';
import { MouseService } from '@app/services/mouse.service';
import { PopUpService } from '@app/services/popUpService/pop-up.service';
import { Constants } from '@common/constants';
import { of } from 'rxjs';
import { CreationPageService } from './creation-page.service';
import SpyObj = jasmine.SpyObj;

describe('CreationPageService', () => {
    let service: CreationPageService;
    // let canvasSharingService: CanvasSharingService;
    let mouseServiceSpy: SpyObj<MouseService>;
    let diffServiceSpy: SpyObj<DifferenceDetectorService>;
    // let popUpServiceSpy: SpyObj<PopUpService>;
    let communicationSpy: SpyObj<CommunicationService>;
    // let dialogRefSpy: SpyObj<MatDialogRef<PopUpDialogComponent, any>>;

    // --------------------------------------------------------------------------------- //
    let popUpServiceSpy: any; // Need to have any, not fully sure why.
    // --------------------------------------------------------------------------------- //
    // let onloadRef: Function | undefined;

    beforeEach(() => {
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['mouseHitDetect', 'getCanClick', 'getX', 'getY', 'changeClickState']);
        diffServiceSpy = jasmine.createSpyObj('DifferenceDetectorService', ['detectDifferences']);
        // popUpServiceSpy = jasmine.createSpyObj('PopUpService', ['openDialog'], ['dialogRef']);
        // dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']); // COME CHECK ON THIS LATER
        communicationSpy = jasmine.createSpyObj('CommunicationService', ['postLevel']);
        popUpServiceSpy = jasmine.createSpyObj('PopUpServiceService', ['openDialog', 'dialogRef']);
        popUpServiceSpy.dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
        popUpServiceSpy.dialogRef.afterClosed.and.returnValue(of({ hasAccepted: true }));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CanvasSharingService,
                HttpClient,
                HttpHandler,
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: DifferenceDetectorService, useValue: diffServiceSpy },
                { provide: PopUpService, useValue: popUpServiceSpy },
                { provide: CommunicationService, useValue: communicationSpy },
            ],
            imports: [AppMaterialModule, MatSliderModule, FormsModule, RouterTestingModule],
        });
        // fixture = TestBed.createComponent(CreationComponent);
        service = TestBed.inject(CreationPageService);
        // service.popUpService.dialogRef = dialogRefSpy;
    });

    // beforeAll(() => {
    //     Object.defineProperty(Image.prototype, 'onload', {
    //         get() {
    //             // eslint-disable-next-line no-underscore-dangle
    //             return this._onload;
    //         },
    //         // eslint-disable-next-line @typescript-eslint/ban-types
    //         set(onload: Function) {
    //             onloadRef = onload;
    //             // eslint-disable-next-line no-underscore-dangle
    //             this._onload = onload;
    //         },
    //     });
    // });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('constructor should correctly initialize', fakeAsync(() => {
        spyOn<any>(service, 'getEmptyBMPFile').and.returnValue(Promise.resolve(new File([''], '')));
        spyOn(HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
        const creationService = new CreationPageService(new CanvasSharingService(), diffServiceSpy, popUpServiceSpy, communicationSpy);
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
        service.resetDefault();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDefault should call restartGame and not clearRect from defaultCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].defaultCanvas, 'getContext').and.returnValue(null);
        service.resetDefault();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalledTimes(1);
    });

    it('resetDiff should call restartGame and clearRect from diffCanvas', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const defaultCanvasSpy = spyOnProperty(service['canvasShare'], 'diffCanvas').and.callThrough();
        service.resetDiff();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).toHaveBeenCalledTimes(1);
        expect(defaultCanvasSpy).toHaveBeenCalledTimes(3);
    });

    it('resetDiff should call restartGame and not clearRect from diffCanvas is the canvas is undefined', () => {
        const restartGameSpy = spyOn<any>(service, 'restartGame');
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const getContextSpy = spyOn(service['canvasShare'].diffCanvas, 'getContext').and.returnValue(null);
        service.resetDiff();
        expect(restartGameSpy).toHaveBeenCalledTimes(1);
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalledTimes(1);
    });

    it('slider change should correctly update the value of the radius', () => {
        service.sliderChange(0);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[0]);
        service.sliderChange(1);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[1]);
        service.sliderChange(2);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[2]);
        service.sliderChange(3);
        expect(service['creationSpecs'].radius).toEqual(Constants.RADIUS_TABLE[3]);
    });

    it('detectDifference should call errorDIalog if a or the canvasses are null and not call DifferenceService detectDifferences', () => {
        service['creationSpecs'].defaultCanvasCtx = null;
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
        const errorDialogSpy = spyOn<any>(service, 'errorDialog');
        service.detectDifference();

        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = null;
        service.detectDifference();

        service['creationSpecs'].defaultCanvasCtx = null;
        service['creationSpecs'].diffCanvasCtx = null;
        service.detectDifference();

        expect(errorDialogSpy).toHaveBeenCalledTimes(3);
        expect(diffServiceSpy.detectDifferences).not.toHaveBeenCalled();
    });

    it('detectDifference should not call errorDIalog if none of the canvases are null and call DifferenceService detectDifferences', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
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

        service.detectDifference();

        expect(errorDialogSpy).not.toHaveBeenCalled();
        expect(diffServiceSpy.detectDifferences).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call errorDIalog if DifferenceService detectDifferences returned no LevelDifference', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
        const errorDialogSpy = spyOn<any>(service, 'errorDialog');

        diffServiceSpy.detectDifferences.and.returnValue(undefined);

        service.detectDifference();

        expect(errorDialogSpy).toHaveBeenCalledTimes(1);
    });

    it('detectDifference correctly set the number of differences and isSaveable', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
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

        service.detectDifference();

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).toBeTrue();
    });

    it('detectDifference correctly set the number of differences, isSaveable and differenceAmountMsg', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1, 1, 1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference();

        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMsg']).toEqual(' (Attention, le nombre de différences est trop bas)');

        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1], [1], [1], [1], [1]];
        service.detectDifference();
        expect(service['creationSpecs'].nbDifferences).toEqual(mockLevelDifference.clusters.length);
        expect(service['isSaveable']).not.toBeTrue();
        expect(service['differenceAmountMsg']).toEqual(' (Attention, le nombre de différences est trop élevé)');
    });

    it('detectDifference should call openDialog if the game is not saveable', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference();

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('detectDifference should call openDialog if the game is saveable', () => {
        service['creationSpecs'].defaultCanvasCtx = document.createElement('canvas').getContext('2d');
        service['creationSpecs'].diffCanvasCtx = document.createElement('canvas').getContext('2d');
        spyOn<any>(service, 'errorDialog');

        const mockLevelDifference = new LevelDifferences();
        mockLevelDifference.clusters = [[1], [1], [1], [1], [1], [1]];
        mockLevelDifference.isHard = false;
        mockLevelDifference.canvas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;

        diffServiceSpy.detectDifferences.and.returnValue(mockLevelDifference);

        service.detectDifference();

        expect(popUpServiceSpy.openDialog).toHaveBeenCalledTimes(1);
    });

    it('save game should call open dialog twice if we can save and post level was successful', () => {
        service['isSaveable'] = true;
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

    it('getEmptyBMPFile should return a new File with the correct src', fakeAsync(async () => {
        const result = await service['getEmptyBMPFile']();
        expect(result.name).toEqual('image_empty.bmp');
    }));

    // it('showDefaultImage should call errorDialog if we have no defaultCanvasCtx', fakeAsync(() => {
    //     const errorDialogSPy = spyOn<any>(service, 'errorDialog');
    //     service['creationSpecs'].defaultCanvasCtx = null;
    //     service['showDefaultImage']();
    //     tick();
    //     expect(errorDialogSPy).toHaveBeenCalledTimes(1);
    // }));

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
});
